import { Intent, Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import { faEraser } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import {
    DEFAULT_ANNOTATOR,
    LABEL_AS_TEXT_MODE_LOOKUP,
    LABEL_SCHEMA_OKP,
    MODE_LOOKUP_CODE,
    RECORD_LEVEL_SCHEMA_KEY,
    SPAN_LEVEL_CHAR_SCHEMA_KEY,
} from "../constant";
import { AnnotationContext } from "../context/AnnotationContext";
import { faIcon } from "../icon";
export const OptionList = ({ rowIndex, labelName, schemaLevel, attr }) => {
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    const [labelOptions, setLabelOptions] = useState([]);
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    useEffect(() => {
        let labelOptions = [];
        if (!_.isUndefined(labelName))
            labelOptions = _.get(
                annotationState,
                ["labelNameOptions", labelName],
                []
            );
        else if (!_.isUndefined(schemaLevel)) {
            const schemas = _.get(annotationState, LABEL_SCHEMA_OKP, []);
            for (let i = 0; i < schemas.length; i++) {
                const schema = schemas[i];
                if (_.isEqual(schema.level, schemaLevel))
                    labelOptions = schema.options;
            }
        }
        setLabelOptions(labelOptions);
    }, []);
    const existingValues = _.get(attr, "label_value", []);
    const handleLabelValueChange = (option, operation = "update") => {
        if (_.isEqual(widgetMode, "annotating")) {
            let found = false;
            let newData = _.cloneDeep(_.get(annotationState, "data", []));
            var ipy_payload = {};
            newData = newData.map((datapoint, index) => {
                if (!_.isEqual(index, rowIndex)) return datapoint;
                let labelValues = _.get(
                    datapoint,
                    ["annotation_list", 0, `labels_${schemaLevel}`],
                    []
                ).map((label) => {
                    if (_.isEqual(operation, "delete")) return label;
                    if (
                        _.isEqual(schemaLevel, SPAN_LEVEL_CHAR_SCHEMA_KEY) &&
                        _.isEqual(label.start_idx, attr.start_idx) &&
                        _.isEqual(label.end_idx, attr.end_idx)
                    ) {
                        found = true;
                        return _.set(attr, "label_value", [option.value]);
                    } else if (
                        _.isEqual(schemaLevel, RECORD_LEVEL_SCHEMA_KEY) &&
                        _.isEqual(label.label_name, labelName)
                    ) {
                        found = true;
                        return _.set(attr, "label_value", [option.value]);
                    }
                    return label;
                });
                if (!found && !_.isEqual(operation, "delete")) {
                    if (!_.isNil(labelName)) {
                        labelValues.push({
                            ...attr,
                            label_name: labelName,
                            label_value: [option.value],
                            label_level: "span",
                        });
                    } else {
                        const labelSchemas = _.get(
                            annotationState,
                            LABEL_SCHEMA_OKP,
                            []
                        );
                        for (let i = 0; i < labelSchemas.length; i++) {
                            const schema = labelSchemas[i];
                            if (_.isEqual(schema.level, schemaLevel))
                                labelName = schema.name;
                        }
                    }
                }
                if (_.isEqual(operation, "delete")) {
                    labelValues = labelValues.filter((label) => {
                        if (
                            _.isEqual(
                                schemaLevel,
                                SPAN_LEVEL_CHAR_SCHEMA_KEY
                            ) &&
                            _.isEqual(label.start_idx, attr.start_idx) &&
                            _.isEqual(label.end_idx, attr.end_idx)
                        )
                            return false;
                        else if (
                            _.isEqual(schemaLevel, RECORD_LEVEL_SCHEMA_KEY) &&
                            _.isEqual(label.label_name, labelName)
                        )
                            return false;
                        return true;
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
                _.set(
                    datapoint,
                    ["annotation_list", 0, `labels_${schemaLevel}`],
                    labelValues
                );
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
            const uuid = _.get(
                annotationState,
                ["data", rowIndex, "uuid"],
                null
            );
            if (_.isNil(uuid)) return;
            if (_.isEqual(operation, "delete")) {
                _.set(
                    newReconciliationState,
                    [uuid, labelName, MODE_LOOKUP_CODE[widgetMode]],
                    null
                );
            } else {
                _.set(
                    newReconciliationState,
                    [uuid, labelName, MODE_LOOKUP_CODE[widgetMode]],
                    [option.value]
                );
            }
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
    const displayLabels = labelOptions.filter(
        (option) => !existingValues.includes(option.value)
    );
    const isTagging = _.get(annotationState, "tagSchemaNames", new Set()).has(
        labelName
    );
    return (
        <div onWheelCapture={(event) => event.stopPropagation()}>
            <Menu>
                <MenuDivider
                    title={`${
                        isTagging
                            ? "Tag"
                            : _.get(
                                  LABEL_AS_TEXT_MODE_LOOKUP,
                                  widgetMode,
                                  "Label"
                              )
                    } as`}
                />
                {_.isEmpty(displayLabels) ? (
                    <MenuItem
                        disabled
                        text={`No ${isTagging ? "tag" : "label"} option`}
                    />
                ) : null}
                {displayLabels.map((option, index) => {
                    return (
                        <MenuItem
                            key={`option-list-label-${labelName}-menuitem-${index}`}
                            text={option.text}
                            labelElement={
                                <span style={{ fontWeight: "bolder" }}>
                                    {option.value}
                                </span>
                            }
                            onClick={() => handleLabelValueChange(option)}
                        />
                    );
                })}
                {_.isEmpty(existingValues) ? null : (
                    <>
                        <MenuDivider />
                        <MenuItem
                            icon={faIcon({ icon: faEraser })}
                            disabled={_.isEmpty(existingValues)}
                            text="Remove"
                            intent={Intent.DANGER}
                            onClick={() => handleLabelValueChange({}, "delete")}
                        />
                    </>
                )}
            </Menu>
        </div>
    );
};
