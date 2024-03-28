import { Checkbox } from "@blueprintjs/core";
import _ from "lodash";
import { useContext } from "react";
import { AnnotationContext } from "../../context/AnnotationContext";
export const BulkActionCheckbox = () => {
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    return (
        <Checkbox
            large
            disabled={_.isEmpty(annotationState.data)}
            indeterminate={
                !_.isEmpty(annotationState.selectedDatapointIds) &&
                !_.isEqual(
                    annotationState.data.length,
                    annotationState.selectedDatapointIds.size
                )
            }
            checked={annotationState.tableCheckboxChecked}
            className="margin-0"
            style={{ marginLeft: 2 }}
            onChange={(event) => {
                annotationAction.setTableCheckboxChecked(event.target.checked);
            }}
        />
    );
};
