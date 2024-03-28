import {
    Button,
    ButtonGroup,
    Callout,
    Classes,
    Colors,
    Intent,
    Overlay,
    Tooltip,
} from "@blueprintjs/core";
import { faXmark } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { HotkeysProvider } from "react-hotkeys-hook";
import bpCss from "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import normalizeCss from "../node_modules/normalize.css/normalize.css";
import customCss from "../styles/custom.css";
import utilityCss from "../styles/utility.css";
import { Base } from "./Base";
import { AnnotationWidget } from "./components/annotation/AnnotationWidget";
import { useDraggable } from "./components/hooks/useDraggable";
import { faIcon } from "./components/icon";
import { Direction } from "./components/resizer/constant";
const VALID_ANNOTATION_WIDGET_MODES = [
    "annotating",
    "reconciling",
    "verifying",
];
export const Annotation = (props) => {
    const maxScreen = _.get(props, "config.max_screen", false);
    const widgetMode = _.get(props, "config.mode");
    const validWidgetMode =
        _.isNil(widgetMode) ||
        _.includes(VALID_ANNOTATION_WIDGET_MODES, widgetMode);
    useEffect(() => {
        if (maxScreen) {
            window.addEventListener("resize", handleWindowResize);
            return () =>
                window.removeEventListener("resize", handleWindowResize);
        }
    }, []);
    const [viewHeight, setViewHeight] = useState(
        window.innerHeight - 150.57 - 155 - 1
    );
    const handleWindowResize = () => {
        handleResize(Direction.BottomRight, 0, 0);
        reposition();
    };
    const handleDrag = useCallback(({ x, y }) => {
        return {
            x: Math.min(Math.max(20, x), window.innerWidth - 60),
            y: Math.min(Math.max(131.141, y), window.innerHeight - 60),
        };
    }, []);
    const [dragRef, reposition] = useDraggable({ onDrag: handleDrag });
    const resizeRef = useRef(null);
    const handleResize = (direction) => {
        const dialog = resizeRef.current;
        if (!dialog) return;
        const resizeRight = () => {
            dialog.style.width = `${window.innerWidth - 40}px`;
        };
        const resizeBottom = () => {
            const calculatedHeight = window.innerHeight - 150.57;
            dialog.style.height = `${calculatedHeight}px`;
            setViewHeight(calculatedHeight - 155 - 1);
        };
        switch (direction) {
            case Direction.BottomRight:
                resizeBottom();
                resizeRight();
                break;
            default:
                break;
        }
    };
    const [isOpen, setIsOpen] = useState(true);
    if (!validWidgetMode)
        return (
            <Base>
                <div style={{ padding: 20 }}>
                    <Callout intent="danger" title="Invalid mode" icon={null}>
                        supported modes:{" "}
                        {VALID_ANNOTATION_WIDGET_MODES.join(", ")}.
                    </Callout>
                </div>
            </Base>
        );
    return (
        <HotkeysProvider initiallyActiveScopes={["none"]}>
            <Base border={!maxScreen}>
                {maxScreen ? (
                    <Overlay
                        className="height-0"
                        isOpen={isOpen}
                        enforceFocus={false}
                        autoFocus={false}
                    >
                        <div
                            className={`${Classes.DIALOG} margin-0`}
                            ref={resizeRef}
                            style={{
                                transform: "translate(20px, 131.141px)",
                                position: "relative",
                                height: "calc(100vh - 150.57px)",
                                width: "calc(100vw - 40px)",
                                paddingBottom: 0,
                                overflow: "hidden",
                            }}
                        >
                            <div
                                className={`${
                                    Classes.DIALOG_HEADER
                                } service-subset-${_.get(
                                    props,
                                    "config.ipy_subset",
                                    ""
                                )}`}
                                ref={dragRef}
                            >
                                <ButtonGroup minimal>
                                    <Tooltip
                                        content="Close"
                                        placement="bottom-start"
                                        minimal
                                    >
                                        <Button
                                            className="service-dashboard-close-button"
                                            intent={Intent.DANGER}
                                            icon={faIcon({ icon: faXmark })}
                                            onClick={() => setIsOpen(false)}
                                        />
                                    </Tooltip>
                                </ButtonGroup>
                            </div>
                            <div
                                className={`${Classes.DIALOG_BODY} margin-0-important`}
                                style={{
                                    height: "100%",
                                    overflow: "hidden",
                                    borderTop: "1px solid lightgray",
                                    backgroundColor: Colors.WHITE,
                                }}
                            >
                                <AnnotationWidget
                                    {...props}
                                    viewHeight={viewHeight}
                                />
                            </div>
                        </div>
                        <style>{normalizeCss}</style>
                        <style>{bpCss}</style>
                        <style>{customCss}</style>
                        <style>{utilityCss}</style>
                    </Overlay>
                ) : (
                    <AnnotationWidget {...props} />
                )}
            </Base>
        </HotkeysProvider>
    );
};
