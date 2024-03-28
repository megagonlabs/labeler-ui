import { Tag } from "@blueprintjs/core";
import _ from "lodash";
import { useContext } from "react";
import { AnnotationContext } from "../../context/AnnotationContext";
export const PersistentLabelSelection = ({
    setFocusLabel,
    focusLabel,
    labelOptions,
    labelName,
}) => {
    const { annotationState } = useContext(AnnotationContext);
    return labelOptions.map((option, index) => {
        const isSelected =
            !_.isNil(focusLabel) && _.isEqual(focusLabel.value, option.value);
        const tagStyle = _.get(
            annotationState,
            ["labelTagStyles", labelName, option.value, "regular"],
            {}
        );
        return (
            <Tag
                key={`span-level-persistent-labeling-selection-tag-${index}`}
                minimal={!isSelected}
                interactive
                style={{
                    marginRight: _.isEqual(index, labelOptions.length - 1)
                        ? 0
                        : 10,
                    display: "inline-table",
                    ...(isSelected ? tagStyle : {}),
                    height: 21,
                    borderLeft: `10px solid ${tagStyle.backgroundColor}`,
                }}
                className="user-select-none"
                onClick={() =>
                    setFocusLabel(_.isEqual(focusLabel, option) ? null : option)
                }
            >
                {option.text} ({option.value})
            </Tag>
        );
    });
};
