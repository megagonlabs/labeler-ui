import { Checkbox } from "@blueprintjs/core";
import _ from "lodash";
import { useContext } from "react";
import { AnnotationContext } from "../../context/AnnotationContext";
export const ActionCheckbox = ({ rowIndex }) => {
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    return (
        <Checkbox
            large
            checked={annotationState.selectedDatapointIds.has(
                _.get(annotationState, ["data", rowIndex, "uuid"])
            )}
            className="margin-0"
            style={{ marginLeft: 2 }}
            onChange={(event) => {
                annotationAction.setSelectedRowIndex({
                    rowIndex: rowIndex,
                    checked: event.target.checked,
                });
            }}
        />
    );
};
