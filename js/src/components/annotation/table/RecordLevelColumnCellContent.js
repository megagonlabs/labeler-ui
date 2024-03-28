import { Tag } from "@blueprintjs/core";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import {
    DEFAULT_ROW_HEIGHT,
    MODE_LOOKUP_CODE,
    RECORD_LEVEL_LABEL_OKP,
    RECORD_LEVEL_SCHEMA_KEY,
} from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { OptionList } from "../OptionList";
import { DoubleClickPopover } from "./DoubleClickPopover";
export const RecordLevelColumnCellContent = ({
    rowIndex,
    labelName = null,
    readonly = false,
}) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [attr, setAttr] = useState(null);
    const { annotationState } = useContext(AnnotationContext);
    const currentLabel = _.get(
        annotationState,
        "reconciliation.currentLabel",
        null
    );
    const rowLabelName = _.isNil(labelName) ? currentLabel : labelName;
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    useEffect(() => {
        let found = false,
            attr = null;
        const datapoint = _.get(annotationState, ["data", rowIndex], {});
        if (_.isEqual(widgetMode, "annotating")) {
            const annotations = _.get(datapoint, RECORD_LEVEL_LABEL_OKP, []);
            for (let i = 0; i < annotations.length; i++) {
                const label = annotations[i];
                if (
                    !_.isNil(label) &&
                    _.isEqual(label.label_name, rowLabelName)
                ) {
                    attr = label;
                    found = true;
                    setSelectedOptions(label.label_value);
                }
            }
        } else if (["reconciling", "verifying"].includes(widgetMode)) {
            const uuid = _.get(datapoint, "uuid", null);
            if (!_.isNil(uuid)) {
                const labelValue = _.get(
                    annotationState,
                    [
                        "reconciliation",
                        "data",
                        uuid,
                        rowLabelName,
                        _.isEqual(widgetMode, "verifying") && readonly
                            ? "verification-readonly"
                            : MODE_LOOKUP_CODE[widgetMode],
                    ],
                    null
                );
                if (!_.isNil(labelValue)) {
                    attr = {
                        label_name: rowLabelName,
                        label_value: labelValue,
                        label_level: "record",
                    };
                    found = true;
                    setSelectedOptions(labelValue);
                }
            }
        }
        if (!found) setSelectedOptions([]);
        setAttr(attr);
    }, [annotationState.data, annotationState.reconciliation.data]);
    const target = (
        <div
            style={{
                height: DEFAULT_ROW_HEIGHT + "px",
                display: "inline-flex",
                lineHeight: DEFAULT_ROW_HEIGHT + "px",
                alignItems: "center",
            }}
        >
            {_.isEmpty(selectedOptions)
                ? "-"
                : selectedOptions.map((value, index) => {
                      const tagStyle = _.get(
                          annotationState,
                          ["labelTagStyles", rowLabelName, value, "minimal"],
                          {}
                      );
                      return (
                          <Tag
                              key={`record-level-column-cell-content-row-${rowIndex}-tag-${index}`}
                              large
                              minimal
                              style={{
                                  ...tagStyle,
                                  ...(readonly
                                      ? {
                                            backgroundColor: "transparent",
                                            fontWeight: "bold",
                                        }
                                      : {}),
                              }}
                          >
                              {value}
                          </Tag>
                      );
                  })}
        </div>
    );
    if (readonly) return target;
    return (
        <DoubleClickPopover
            content={
                <OptionList
                    schemaLevel={RECORD_LEVEL_SCHEMA_KEY}
                    labelName={rowLabelName}
                    rowIndex={rowIndex}
                    attr={attr}
                />
            }
            target={target}
        />
    );
};
