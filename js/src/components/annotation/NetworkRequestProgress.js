import { ProgressBar, Tooltip } from "@blueprintjs/core";
import { useContext } from "react";
import { AnnotationContext } from "../context/AnnotationContext";
export const NetworkRequestProgress = () => {
    const { annotationState } = useContext(AnnotationContext);
    return (
        <Tooltip
            minimal
            usePortal={false}
            position="top"
            content={`${
                annotationState.networkRequests.queued -
                annotationState.networkRequests.completed
            } network request${
                annotationState.networkRequests.queued -
                    annotationState.networkRequests.completed >
                1
                    ? "s"
                    : ""
            } remaining`}
        >
            <div style={{ width: 100, marginTop: 2 }}>
                <ProgressBar
                    stripes
                    animate
                    value={
                        annotationState.networkRequests.completed /
                        annotationState.networkRequests.queued
                    }
                />
            </div>
        </Tooltip>
    );
};
