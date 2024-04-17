import { Button, Intent } from "@blueprintjs/core";
import {
    faBadgeCheck,
    faFloppyDisk,
    faStamp,
} from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import {
    MODE_LOOKUP_CODE,
    notebook_call,
    python_error_toast,
} from "../constant";
import { AnnotationContext } from "../context/AnnotationContext";
import { faIcon } from "../icon";
const SUBMIT_BUTTON_LOOKUP = {
    annotating: { intent: Intent.PRIMARY, icon: faFloppyDisk },
    reconciling: { intent: Intent.SUCCESS, icon: faStamp },
    verifying: { intent: Intent.WARNING, icon: faBadgeCheck },
};
export const SaveButton = () => {
    const [submitting, setSubmitting] = useState(false);
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    const submissionAudit = _.get(annotationState, "submissionAudit", {});
    const [hasSubmissionError, setHasSubmissionError] = useState(false);
    const currentLabel = _.get(
        annotationState,
        "reconciliation.currentLabel",
        null
    );
    useEffect(() => {
        setHasSubmissionError(false);
        for (let auditKey in submissionAudit) {
            if (_.isEqual(submissionAudit[auditKey]["state"], "error")) {
                setHasSubmissionError(true);
                break;
            }
        }
    }, [submissionAudit]);
    const updateAnnotations = (command, count, message) => {
        notebook_call(
            command,
            _.get(annotationState, "ipy_interface.kernel_id")
        )
            .then((result) => {
                annotationAction.trackNetworkRequest({
                    state: "completed",
                    count: count,
                });
                const result_list = JSON.parse(result);
                for (let i = 0; i < result_list.length; i++) {
                    const hasError =
                            _.get(result_list[i], "error", false) !== false,
                        uuid = _.get(result_list[i], "uuid");
                    if (hasError) {
                        annotationAction.updateSubmissionAudit({
                            uuid: uuid,
                            content: {
                                state: "error",
                                message: _.get(result_list[i], "error"),
                            },
                        });
                    } else {
                        annotationAction.updateSubmissionAudit({
                            uuid: uuid,
                            content: { state: "success" },
                        });
                    }
                }
            })
            .catch((error) => {
                annotationAction.trackNetworkRequest({
                    state: "completed",
                    count: count,
                });
                python_error_toast({
                    code: command,
                    message: message,
                    error: error,
                });
            });
    };
    const set_verification_helper = (payload_list, processing) => {
        const verifyingId = _.get(annotationState, "verifyingId", null);
        for (let i = 0; i < payload_list.length; i++)
            payload_list[i]["annotator_id"] = verifyingId;
        const set_verification_command = `MegannoSubset.${_.get(
            annotationState,
            "ipy_interface.service"
        )}.set_verification_data(verify_list=json.loads('${JSON.stringify(
            payload_list
        )}'))`;
        updateAnnotations(
            set_verification_command,
            processing.length,
            "Unable to verify annotations."
        );
    };
    const handleSubmitAnnotation = () => {
        let selectedDatapointIds = _.get(
            annotationState,
            "recentlyUpdatedDataIds",
            new Set()
        );
        const submissionAudit = _.get(annotationState, "submissionAudit", {});
        // when save, submit both recently updated and with submit error records
        for (let auditKey in submissionAudit) {
            if (_.isEqual(submissionAudit[auditKey]["state"], "error")) {
                selectedDatapointIds.add(auditKey);
            }
        }
        selectedDatapointIds = Array.from(selectedDatapointIds);
        setSubmitting(true);
        const BATCH_SIZE = 6;
        var start_idx = 0;
        while (start_idx < selectedDatapointIds.length) {
            var processing = [];
            for (let i = 0; i < BATCH_SIZE; i++) {
                if (start_idx + i >= selectedDatapointIds.length) continue;
                processing.push(selectedDatapointIds[start_idx + i]);
            }
            start_idx += BATCH_SIZE;
            annotationAction.setRecentlyUpdatedStatus({
                state: "submitted",
                uuids: processing,
            });
            annotationAction.trackNetworkRequest({
                state: "queued",
                count: processing.length,
            });
            if (_.isEqual(widgetMode, "annotating")) {
                const submit_annotation_command = `MegannoSubset.${_.get(
                    annotationState,
                    "ipy_interface.service"
                )}.submit_annotations(uuid_list=['${processing.join(
                    "','"
                )}'], subset=MegannoSubset.${_.get(annotationState, [
                    "ipy_interface",
                    "subset",
                ])})`;
                updateAnnotations(
                    submit_annotation_command,
                    processing.length,
                    "Unable to submit annotations."
                );
            } else if (
                ["reconciling", "verifying"].includes(widgetMode) &&
                !_.isNil(currentLabel)
            ) {
                var payload_list = [];
                for (let i = 0; i < processing.length; i++) {
                    const uuid = processing[i];
                    const labelValue = _.get(
                        annotationState,
                        [
                            "reconciliation",
                            "data",
                            uuid,
                            currentLabel,
                            MODE_LOOKUP_CODE[widgetMode],
                        ],
                        null
                    );
                    payload_list.push({
                        uuid: uuid,
                        labels: [
                            {
                                label_name: currentLabel,
                                label_level: "record",
                                label_value: labelValue,
                            },
                        ],
                    });
                }
                const set_reconciliation_command = `MegannoSubset.${_.get(
                    annotationState,
                    "ipy_interface.service"
                )}.set_reconciliation_data(recon_list=json.loads('${JSON.stringify(
                    payload_list
                )}'))`;
                if (_.isEqual(widgetMode, "reconciling"))
                    updateAnnotations(
                        set_reconciliation_command,
                        processing.length,
                        "Unable to reconcile annotations."
                    );
                else set_verification_helper(payload_list, processing);
            }
        }
        setSubmitting(false);
    };
    return (
        <Button
            intent={SUBMIT_BUTTON_LOOKUP[widgetMode].intent}
            text="Save"
            loading={submitting}
            disabled={
                _.isEmpty(annotationState.recentlyUpdatedDataIds) &&
                !hasSubmissionError
            }
            icon={faIcon({ icon: SUBMIT_BUTTON_LOOKUP[widgetMode].icon })}
            minimal
            onClick={handleSubmitAnnotation}
        />
    );
};
