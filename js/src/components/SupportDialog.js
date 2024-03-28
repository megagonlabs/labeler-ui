import { Classes, Dialog, Divider, H4 } from "@blueprintjs/core";
import _ from "lodash";
import { useContext } from "react";
import { AnnotationContext } from "./context/AnnotationContext";
import { AnnotatingDoc } from "./support/AnnotatingDoc";
import { ReconcilingDoc } from "./support/ReconcilingDoc";
import { VerifyingDoc } from "./support/VerifyingDoc";
export const SupportDialog = ({ showSupportDialog, setShowSupportDialog }) => {
    const { annotationState } = useContext(AnnotationContext);
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    const JSX = {
        annotating: <AnnotatingDoc />,
        reconciling: <ReconcilingDoc />,
        verifying: <VerifyingDoc />,
    };
    return (
        <Dialog
            style={{
                height: "50vh",
                width: 1000,
                maxWidth: "calc(100vw - 40px)",
            }}
            isOpen={showSupportDialog}
            canOutsideClickClose
            canEscapeKeyClose
            onClose={() => setShowSupportDialog(false)}
        >
            <div
                className="support-dialog-docs"
                style={{ padding: 20, overflowY: "auto" }}
            >
                <H4>Help</H4>
                <Divider />
                <div className={Classes.RUNNING_TEXT}>
                    {_.get(JSX, widgetMode, "")}
                </div>
            </div>
        </Dialog>
    );
};
