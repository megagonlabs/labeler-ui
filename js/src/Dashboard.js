import {
    Button,
    ButtonGroup,
    Classes,
    Intent,
    Overlay,
    Tooltip,
} from "@blueprintjs/core";
import {
    faExpandWide,
    faWindowMinimize,
    faXmark,
} from "@fortawesome/pro-duotone-svg-icons";
import classNames from "classnames";
import _ from "lodash";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import bpCss from "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import normalizeCss from "../node_modules/normalize.css/normalize.css";
import customCss from "../styles/custom.css";
import utilityCss from "../styles/utility.css";
import { Base } from "./Base";
import {
    MINIMUM_WIDGET_VIEW_HEIGHT,
    notebook_call,
    python_error_toast,
} from "./components/constant";
import { DashboardContext } from "./components/context/DashboardContext";
import { Main } from "./components/dashboard/Main";
import { useDraggable } from "./components/hooks/useDraggable";
import { faIcon } from "./components/icon";
import Resizer from "./components/resizer/Resizer";
import { Direction } from "./components/resizer/constant";
export const Dashboard = ({ config, ipy_service, ipy_kernel_id, wid }) => {
    const { dashboardAction } = useContext(DashboardContext);
    const [tabId, setTabId] = useState(null);
    const isColab =
        !_.isEqual(typeof google, "undefined") &&
        _.isFunction(google.colab.kernel.invokeFunction);
    const [initStages, setInitStages] = useState([
        { text: "Loading project" },
        { text: "Fetching schemas" },
    ]);
    const isInitFinished = _.isEmpty(
        initStages.filter((stage) => !_.get(stage, "complete", false))
    );
    const [project, setProject] = useState({});
    const completeStage = (stageIdx) => {
        var stageState = [...initStages];
        for (let i = 0; i < stageState.length; i++) {
            if (_.isEqual(i, stageIdx)) {
                _.set(stageState, [i, "complete"], true);
            }
        }
        setInitStages(stageState);
    };
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
    const handleResize = (direction, movementX, movementY) => {
        const dialog = resizeRef.current;
        if (!dialog) return;
        const { width, height } = dialog.getBoundingClientRect();
        const resizeRight = () => {
            dialog.style.width = `${Math.min(
                Math.max(MINIMUM_WIDGET_VIEW_HEIGHT * 1.5, width + movementX),
                window.innerWidth - 40
            )}px`;
        };
        const resizeBottom = () => {
            dialog.style.height = `${Math.min(
                Math.max(MINIMUM_WIDGET_VIEW_HEIGHT, height + movementY),
                window.innerHeight - 150.57
            )}px`;
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
    const [isMinimized, setIsMinimized] = useState(false);
    useEffect(() => {
        if (!_.isNil(ipy_service)) {
            const get_project_info_command = `LabelerService.${ipy_service}.get_project_info()`;
            notebook_call(get_project_info_command, ipy_kernel_id)
                .then((project_info) => {
                    const result = JSON.parse(project_info);
                    const project_id = _.get(result, "id", "");
                    setProject(result);
                    const allWithClass = Array.from(
                        document.querySelectorAll(
                            `[class*='service-dashboard-project-${project_id}']`
                        )
                    ).sort(
                        (left, right) =>
                            right.dataset.order - left.dataset.order
                    );
                    for (var i = 1; i < allWithClass.length; i++)
                        allWithClass[i]
                            .getElementsByClassName(
                                "service-dashboard-close-button"
                            )[0]
                            .click();
                    completeStage(0);
                    const get_active_schemas_command = `LabelerService.${ipy_service}.get_schemas().get_active_schemas()`;
                    notebook_call(get_active_schemas_command, ipy_kernel_id)
                        .then((schemas) => {
                            completeStage(1);
                            const active_schemas = _.get(
                                JSON.parse(schemas),
                                [0, "schemas", "label_schema"],
                                []
                            );
                            dashboardAction.setStateByKey({
                                key: "schemas",
                                value: active_schemas,
                            });
                            for (let i = 0; i < active_schemas.length; i++) {
                                if (
                                    _.isEqual(active_schemas[i].level, "record")
                                ) {
                                    setTimeout(() => {
                                        dashboardAction.setStateByKey({
                                            key: "focusLabel",
                                            value: active_schemas[i].name,
                                        });
                                    }, 0);
                                    break;
                                }
                            }
                        })
                        .catch((error) => {
                            python_error_toast({
                                code: get_active_schemas_command,
                                message: "Unable to get active schemas.",
                                error: error,
                            });
                        });
                })
                .catch((error) => {
                    python_error_toast({
                        code: get_project_info_command,
                        message: "Unable to get project info.",
                        error: error,
                    });
                });
        }
        dashboardAction.setStateByKey({
            key: "projection",
            value: _.get(config, "projection", {}),
        });
        dashboardAction.setStateByKey({
            key: "ipy_interface",
            value: {
                service: ipy_service,
                kernel_id: ipy_kernel_id,
            },
        });
        setTabId("overview");
        window.addEventListener("resize", handleWindowResize);
        return () => window.removeEventListener("resize", handleWindowResize);
    }, []);
    return (
        <Base border={isColab}>
            {isColab ? (
                <div
                    style={{
                        height: MINIMUM_WIDGET_VIEW_HEIGHT,
                        overflowY: "auto",
                    }}
                >
                    <Main
                        title={
                            <h4
                                className={classNames({
                                    [Classes.HEADING]: true,
                                    [Classes.SKELETON]: !isInitFinished,
                                })}
                                style={{
                                    margin: 0,
                                    marginRight: 10,
                                    lineHeight: "30px",
                                }}
                            >
                                {_.get(project, "project_name", "-")}
                            </h4>
                        }
                        isInitFinished={isInitFinished}
                        setTabId={setTabId}
                        tabId={tabId}
                        initStages={initStages}
                    />
                </div>
            ) : (
                <Overlay
                    className="labeler-widget height-0"
                    isOpen={isOpen}
                    hasBackdrop={false}
                    enforceFocus={false}
                    autoFocus={false}
                >
                    <div
                        className={`${Classes.DIALOG} margin-0`}
                        ref={resizeRef}
                        style={{
                            transform: "translate(20px, 131.141px)",
                            position: "relative",
                            display: isMinimized ? "none" : null,
                            height: MINIMUM_WIDGET_VIEW_HEIGHT,
                            width: MINIMUM_WIDGET_VIEW_HEIGHT * 1.5,
                            paddingBottom: 0,
                            overflow: "hidden",
                        }}
                    >
                        <Resizer onResize={handleResize} />
                        <div
                            className={`${
                                Classes.DIALOG_HEADER
                            } service-dashboard-project-${_.get(
                                project,
                                "id",
                                ""
                            )}`}
                            data-order={wid}
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
                                <Tooltip
                                    content="Hide"
                                    placement="bottom"
                                    minimal
                                >
                                    <Button
                                        minimal
                                        intent={Intent.WARNING}
                                        icon={faIcon({
                                            icon: faWindowMinimize,
                                        })}
                                        onClick={() => setIsMinimized(true)}
                                    />
                                </Tooltip>
                                <Tooltip
                                    content="Maximize"
                                    placement="bottom"
                                    minimal
                                >
                                    <Button
                                        intent={Intent.SUCCESS}
                                        icon={faIcon({
                                            icon: faExpandWide,
                                        })}
                                        onClick={() =>
                                            handleResize(
                                                Direction.BottomRight,
                                                window.innerWidth,
                                                window.innerHeight
                                            )
                                        }
                                    />
                                </Tooltip>
                            </ButtonGroup>
                            <h4
                                className={classNames({
                                    [Classes.HEADING]: true,
                                    [Classes.SKELETON]: !isInitFinished,
                                })}
                                style={{ marginLeft: 10, marginRight: 10 }}
                            >
                                {_.get(project, "project_name", "-")}
                            </h4>
                        </div>
                        <div
                            className={`${Classes.DIALOG_BODY} margin-0-important`}
                            style={{
                                height: "100%",
                                overflow: "hidden",
                            }}
                        >
                            <Main
                                isInitFinished={isInitFinished}
                                setTabId={setTabId}
                                tabId={tabId}
                                initStages={initStages}
                            />
                        </div>
                    </div>
                    <style>{normalizeCss}</style>
                    <style>{bpCss}</style>
                    <style>{customCss}</style>
                    <style>{utilityCss}</style>
                    <div
                        className={`rafael ${Classes.DIALOG} margin-0`}
                        style={{
                            position: "absolute",
                            top: "calc(100vh - 40px)",
                            overflow: "hidden",
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                            width: 250,
                            left: 20,
                            display: isMinimized ? null : "none",
                            cursor: "pointer",
                        }}
                        onClick={() => setIsMinimized(false)}
                    >
                        <div className={Classes.DIALOG_HEADER}>
                            <Tooltip
                                content="Close"
                                placement="top-start"
                                minimal
                            >
                                <Button
                                    minimal
                                    intent={Intent.DANGER}
                                    icon={faIcon({ icon: faXmark })}
                                    onClick={() => setIsOpen(false)}
                                />
                            </Tooltip>
                            <h4
                                className={classNames({
                                    [Classes.HEADING]: true,
                                    [Classes.SKELETON]: !isInitFinished,
                                })}
                                style={{ marginLeft: 10, marginRight: 10 }}
                            >
                                {_.get(project, "project_name", "-")}
                            </h4>
                        </div>
                    </div>
                </Overlay>
            )}
        </Base>
    );
};
