import _ from "lodash";
import { useContext } from "react";
import { AnnotationContext } from "../../context/AnnotationContext";
export const LabelMetadataCell = ({ rowIndex, metadataKey }) => {
    const { annotationState } = useContext(AnnotationContext);
    const currentLabel = _.get(
        annotationState,
        "reconciliation.currentLabel",
        null
    );
    const uuid = _.get(annotationState, ["data", rowIndex, "uuid"], []);
    return (
        <div>
            {_.get(
                annotationState,
                ["labelMetadata", uuid, currentLabel, metadataKey, "value"],
                "-"
            )}
        </div>
    );
};
