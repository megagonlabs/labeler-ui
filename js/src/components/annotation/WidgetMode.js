import { Button, Colors, Intent, Tooltip } from "@blueprintjs/core";
import {
    faHandshakeSimple,
    faHighlighterLine,
    faScannerGun,
} from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect } from "react";
import { HEX_TRANSPARENCY } from "../constant";
import { AnnotationContext } from "../context/AnnotationContext";
import { faIcon } from "../icon";
export const WidgetMode = () => {
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    const editorModeLookUp = {
        annotating: {
            text: "Annotating",
            info: <div>Annotate data with different labels</div>,
            icon: faHighlighterLine,
            intent: Intent.PRIMARY,
            buttonStyle: {
                backgroundColor: `${Colors.BLUE3}${HEX_TRANSPARENCY[10]}`,
            },
            iconStyle: { color: Colors.BLUE3 },
        },
        reconciling: {
            text: "Reconciling",
            info: <div>Aggregate labels from different annotators</div>,
            icon: faHandshakeSimple,
            intent: Intent.SUCCESS,
            buttonStyle: {
                backgroundColor: `${Colors.GREEN3}${HEX_TRANSPARENCY[10]}`,
            },
            iconStyle: { color: Colors.GREEN3 },
        },
        verifying: {
            text: "Verifying",
            info: <div>Verify or confirm annotations</div>,
            icon: faScannerGun,
            intent: Intent.WARNING,
            buttonStyle: {
                backgroundColor: `${Colors.ORANGE3}${HEX_TRANSPARENCY[10]}`,
            },
            iconStyle: { color: Colors.ORANGE3 },
        },
    };
    useEffect(() => {
        annotationAction.onFilterChange({ ...annotationState.filter });
    }, [annotationState.widgetMode]);
    return (
        <Tooltip
            usePortal={false}
            minimal
            placement="bottom-end"
            content={editorModeLookUp[widgetMode].info}
        >
            <Button
                className="user-select-none"
                active
                style={{
                    ...editorModeLookUp[widgetMode].buttonStyle,
                    marginLeft: 15,
                }}
                intent={editorModeLookUp[widgetMode].intent}
                minimal
                icon={faIcon({
                    icon: editorModeLookUp[widgetMode].icon,
                })}
                text={<strong>{editorModeLookUp[widgetMode].text}</strong>}
            />
        </Tooltip>
    );
};
