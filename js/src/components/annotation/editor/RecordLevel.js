import {
    Button,
    Classes,
    Divider,
    FormGroup,
    H4,
    Radio,
    RadioGroup,
    Tooltip,
} from "@blueprintjs/core";
import { faEraser } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import {
    DEFAULT_ANNOTATOR,
    LABEL_SCHEMA_OKP,
    MODE_LOOKUP_CODE,
    RECORD_LEVEL_LABEL_OKP,
    RECORD_LEVEL_SCHEMA_KEY,
} from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { faIcon } from "../../icon";
export const RecordLevel = ({ rowIndex }) => {
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    const [labelNameValue, setLabelNameValue] = useState({});
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    const currentLabel = _.get(
        annotationState,
        "reconciliation.currentLabel",
        null
    );
    const uuid = _.get(annotationState, ["data", rowIndex, "uuid"], null);
    useEffect(() => {
        let newLabelNameValue = {};
        if (_.isEqual(widgetMode, "annotating")) {
            const recordLabels = _.get(
                annotationState,
                ["data", rowIndex, ...RECORD_LEVEL_LABEL_OKP],
                []
            );
            for (let i = 0; i < recordLabels.length; i++) {
                const record = recordLabels[i];
                if (
                    !_.isNil(record.label_value) &&
                    !_.isEmpty(record.label_value)
                )
                    newLabelNameValue[record.label_name] =
                        record.label_value[0];
            }
        } else if (["reconciling", "verifying"].includes(widgetMode)) {
            newLabelNameValue[currentLabel] = _.get(
                annotationState,
                [
                    "reconciliation",
                    "data",
                    uuid,
                    currentLabel,
                    MODE_LOOKUP_CODE[widgetMode],
                    0,
                ],
                null
            );
        }
        setLabelNameValue(newLabelNameValue);
    }, [rowIndex, annotationState.data, annotationState.reconciliation.data]);
    const handleRadioChange = (event, labelName) => {
        if (_.isEqual(widgetMode, "annotating")) {
            let found = false;
            let newData = [..._.get(annotationState, "data", [])];
            var ipy_payload = {};
            newData = newData.map((datapoint, index) => {
                if (!_.isEqual(index, rowIndex)) return datapoint;
                let labelRecord = _.get(
                    datapoint,
                    [...RECORD_LEVEL_LABEL_OKP],
                    []
                )
                    .filter((record) => {
                        if (
                            _.isNil(event) &&
                            _.isEqual(record.label_name, labelName)
                        )
                            return false;
                        return true;
                    })
                    .map((record) => {
                        if (!_.isEqual(record.label_name, labelName))
                            return record;
                        found = true;
                        record.label_value = [event.target.value];
                        return record;
                    });
                if (!found && !_.isNil(event)) {
                    labelRecord.push({
                        label_name: labelName,
                        label_value: [event.target.value],
                        label_level: "record",
                    });
                }
                _.set(
                    datapoint,
                    ["annotation_list", 0, "annotator"],
                    _.get(
                        annotationState,
                        "config.annotator.user_id",
                        DEFAULT_ANNOTATOR.user_id
                    )
                );
                annotationAction.setRecentlyUpdatedStatus({
                    state: "updated",
                    uuids: [datapoint.uuid],
                });
                _.set(ipy_payload, "uuid", datapoint.uuid);
                _.set(datapoint, [...RECORD_LEVEL_LABEL_OKP], labelRecord);
                _.set(
                    ipy_payload,
                    "labels",
                    _.get(datapoint, ["annotation_list", 0])
                );
                return datapoint;
            });
            annotationAction.setIpySubsetAnnotations(ipy_payload);
            annotationAction.setData(newData);
        } else if (["reconciling", "verifying"].includes(widgetMode)) {
            var newReconciliationState = _.cloneDeep(
                annotationState.reconciliation.data
            );
            if (_.isNil(uuid)) return;
            _.set(
                newReconciliationState,
                [uuid, labelName, MODE_LOOKUP_CODE[widgetMode]],
                _.isNil(event) ? null : [event.target.value]
            );
            annotationAction.setStateByKey({
                key: "reconciliation",
                value: {
                    ...annotationState.reconciliation,
                    data: newReconciliationState,
                },
            });
            annotationAction.setRecentlyUpdatedStatus({
                state: "updated",
                uuids: [uuid],
            });
        }
    };
    const labelSchemas = _.get(annotationState, LABEL_SCHEMA_OKP, []);
    return (
        <div>
            {labelSchemas.map((schema, index) => {
                const isClearButtonShowing = !_.isNil(
                    _.get(labelNameValue, schema.name, null)
                );
                if (
                    schema.tagging ||
                    !_.isEqual(schema.level, RECORD_LEVEL_SCHEMA_KEY) ||
                    (_.isEqual(widgetMode, "reconciling") &&
                        !_.isEqual(currentLabel, schema.name))
                )
                    return null;
                return (
                    <div
                        key={`record-level-form-group-${index}`}
                        style={{ position: "relative" }}
                    >
                        <FormGroup
                            label={
                                <Tooltip
                                    placement="left"
                                    className="margin-0-important"
                                    content={schema.name}
                                >
                                    <H4
                                        style={{
                                            maxWidth: isClearButtonShowing
                                                ? "calc(100% - 96.88px)"
                                                : null,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            marginBottom: 0,
                                            lineHeight: "30px",
                                        }}
                                    >
                                        {schema.name}
                                    </H4>
                                </Tooltip>
                            }
                        >
                            {_.isEmpty(schema.options) ? (
                                <div
                                    style={{
                                        marginTop: 7,
                                        cursor: "not-allowed",
                                    }}
                                    className={Classes.TEXT_DISABLED}
                                >
                                    No label option
                                </div>
                            ) : null}
                            <RadioGroup
                                onChange={(event) =>
                                    handleRadioChange(event, schema.name)
                                }
                                selectedValue={labelNameValue[schema.name]}
                            >
                                {schema.options.map((option, index) => (
                                    <Radio
                                        key={`editor-record-level-radio-${index}`}
                                        label={`${option.text} (${option.value})`}
                                        value={option.value}
                                    />
                                ))}
                            </RadioGroup>
                        </FormGroup>
                        {isClearButtonShowing ? (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    right: 0,
                                    width: 117.16,
                                }}
                            >
                                <Button
                                    style={{
                                        position: "absolute",
                                        right: 0,
                                        top: 0,
                                    }}
                                    intent="danger"
                                    minimal
                                    text="Remove"
                                    icon={faIcon({
                                        icon: faEraser,
                                    })}
                                    onClick={() =>
                                        handleRadioChange(null, schema.name)
                                    }
                                />
                            </div>
                        ) : null}
                        {!_.isEqual(
                            index,
                            annotationState.lastRecordLevelSchemaIndex
                        ) && !_.isEqual(widgetMode, "reconciling") ? (
                            <Divider style={{ marginBottom: 20 }} />
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
};
