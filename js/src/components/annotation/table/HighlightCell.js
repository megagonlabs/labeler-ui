import _ from "lodash";
import { useContext } from "react";
import { AnnotationContext } from "../../context/AnnotationContext";
export const HighlightCell = ({ children, rowIndex, padding }) => {
    const { annotationState } = useContext(AnnotationContext);
    const recentlyUpdatedDataIds = _.get(
        annotationState,
        "recentlyUpdatedDataIds",
        new Set()
    );
    const uuid = _.get(annotationState, ["data", rowIndex, "uuid"], null);
    const updated = recentlyUpdatedDataIds.has(uuid);
    return (
        <div
            style={{
                padding: padding ? "0px 10px" : null,
                backgroundColor: updated ? "#E5E8EB40" : null,
            }}
        >
            {children}
        </div>
    );
};
