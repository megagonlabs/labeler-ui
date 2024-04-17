import {
    Alignment,
    Button,
    Card,
    Classes,
    Divider,
    H3,
    InputGroup,
    Navbar,
    NavbarGroup,
    NavbarHeading,
    Popover,
    PopoverInteractionKind,
    Tag,
    Tooltip,
    mergeRefs,
} from "@blueprintjs/core";
import {
    faArrowLeft,
    faArrowRight,
    faQuestionCircle,
    faSearch,
    faSpinnerThird,
} from "@fortawesome/pro-duotone-svg-icons";
import classNames from "classnames";
import _ from "lodash";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useHotkeys, useHotkeysContext } from "react-hotkeys-hook";
import { CompatibilityCheck } from "../../components/CompatibilityCheck";
import { LoadingScreen } from "../../components/annotation/LoadingScreen";
import { NetworkRequestProgress } from "../../components/annotation/NetworkRequestProgress";
import { ViewSelector } from "../../components/annotation/ViewSelector";
import { Editor } from "../../components/annotation/editor/Editor";
import { EditorToolStrip } from "../../components/annotation/editor/EditorToolStrip";
import { SearchPopoverContent } from "../../components/annotation/table/SearchPopoverContent";
import { Table } from "../../components/annotation/table/Table";
import { TableToolStrip } from "../../components/annotation/table/TableToolStrip";
import {
    DEFAULT_ANNOTATOR,
    MINIMUM_WIDGET_VIEW_HEIGHT,
    MODE_LOOKUP_CODE,
    SEARCH_FORMAT_TAGS,
    notebook_call,
    python_error_toast,
} from "../../components/constant";
import { AnnotationContext } from "../../components/context/AnnotationContext";
import { faIcon } from "../../components/icon";
import { SupportDialog } from "../SupportDialog";
import { ViewConfigurator } from "./ViewConfigurator";
import { WidgetMode } from "./WidgetMode";
const NAV_BAR_HEIGHT = 45;
export const AnnotationWidget = ({
    ipy_subset,
    ipy_kernel_id,
    data,
    ipy_service,
    config,
    ipy_set_data,
    viewHeight = null,
}) => {
    const height = _.isNil(viewHeight)
        ? _.get(config, "height", MINIMUM_WIDGET_VIEW_HEIGHT)
        : viewHeight;
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    const [initStages, setInitStages] = useState([
        { text: "Fetching schemas" },
        { text: "Retrieving annotator" },
        { text: "Loading data" },
    ]);
    const recentlyUpdatedSize = _.size(
        _.get(annotationState, "recentlyUpdatedDataIds", new Set())
    );
    const isInitFinished =
        _.isEmpty(
            initStages.filter((stage) => !_.get(stage, "complete", false))
        ) || _.isNil(ipy_subset);
    const completeStage = (stageIdx) => {
        var stageState = [...initStages];
        for (let i = 0; i < stageState.length; i++) {
            if (_.isEqual(i, stageIdx)) {
                _.set(stageState, [i, "complete"], true);
            }
        }
        setInitStages(stageState);
    };
    const widgetMode = _.get(config, "mode", "annotating");
    useEffect(() => {
        const kernel_id = ipy_kernel_id;
        if (!_.isNil(ipy_subset)) {
            const get_active_schemas_command = `MegannoSubset.${ipy_service}.get_schemas().get_active_schemas()`;
            notebook_call(get_active_schemas_command, kernel_id)
                .then((schemas) => {
                    completeStage(0);
                    const active_schemas = _.get(
                        JSON.parse(schemas),
                        [0, "schemas", "label_schema"],
                        []
                    );
                    config.label_schema = active_schemas;
                    const get_annotator_command = `MegannoSubset.${ipy_service}.get_annotator()`;
                    notebook_call(get_annotator_command, kernel_id)
                        .then((annotator) => {
                            completeStage(1);
                            config.annotator = JSON.parse(annotator);
                            const get_subset_value = `MegannoSubset.${ipy_subset}.value()`;
                            notebook_call(get_subset_value, kernel_id)
                                .then((result) => {
                                    initializations(JSON.parse(result), true);
                                    completeStage(2);
                                })
                                .catch((error) => {
                                    python_error_toast({
                                        code: get_subset_value,
                                        message:
                                            "Unable to get value of the subset.",
                                        error: error,
                                    });
                                });
                        })
                        .catch((error) => {
                            python_error_toast({
                                code: get_annotator_command,
                                message: "Unable to get annotator.",
                                error: error,
                            });
                        });
                })
                .catch((error) => {
                    python_error_toast({
                        code: get_active_schemas_command,
                        message: "Unable to get active schemas.",
                        error: error,
                    });
                });
        } else {
            const annotator = _.get(config, "annotator", {});
            if (_.isString(annotator)) {
                config.annotator = {
                    name: annotator,
                    user_id: annotator,
                };
            }
            initializations(data, false);
        }
    }, []);
    const initializations = (data, hasSubmit) => {
        annotationAction.setStateByKey({
            key: "isIndexingDocuments",
            value: true,
        });
        annotationAction.setStateByKey({
            key: "ipy_interface",
            value: {
                subset: ipy_subset,
                service: ipy_service,
                kernel_id: ipy_kernel_id,
            },
        });
        annotationAction.setStateByKey({
            key: "ipySetData",
            value: ipy_set_data,
        });
        annotationAction.setStateByKey({ key: "hasSubmit", value: hasSubmit });
        annotationAction.setStateByKey({
            key: "widgetMode",
            value: widgetMode,
        });
        annotationAction.setStateByKey({
            key: "verifyingId",
            value: _.get(config, "verifying_id", null),
        });
        annotationAction.indexDocuments(data);
        annotationAction.setData(data);
        annotationAction.setConfig(config);
    };
    const title = _.get(annotationState.config, "title", "Annotation");
    const containerRef = useRef(null);
    const [view, setView] = useState(_.get(config, "view", "single"));
    const [queryString, setQueryString] = useState("");
    const [isSearchPopoverOpen, setIsSearchPopoverOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    useEffect(() => {
        setQueryString(annotationState.filter.query);
    }, [annotationState.filter]);
    const { disableScope, enableScope } = useHotkeysContext();
    const annotationRef = useRef(null);
    useEffect(() => {
        var scrollPosition = 0;
        if (_.isEqual(view, "table")) {
            scrollPosition = 51 + height;
        }
        containerRef.current.scroll({
            top: scrollPosition,
            behavior: "instant",
        });
        disableScope("single");
        disableScope("table");
        enableScope(view);
        setTimeout(() => annotationRef.current.focus(), 500);
    }, [view, isInitFinished, height]);
    useEffect(() => {
        const viewConfig = _.get(
            annotationState.config,
            "view",
            _.get(config, "view", "single")
        );
        setView(viewConfig);
        enableScope(viewConfig);
    }, [annotationState.config]);
    const [isSmartHighlightEnabled, setIsSmartHighlightEnabled] =
        useState(true);
    const handleSearchQuery = useCallback(
        _.debounce(({ query, state }) => {
            setIsTyping(false);
            annotationAction.onFilterChange({
                ...state.filter,
                query: query,
            });
        }, 800),
        []
    );
    const previousDatapointRef = useHotkeys(
        "shift+a",
        () => {
            if (annotationState.dataFocusIndex <= 0) return;
            annotationAction.setStateByKey({
                key: "dataFocusIndex",
                value: --annotationState.dataFocusIndex,
            });
        },
        {
            scopes: ["single"],
        }
    );
    const nextDatapointRef = useHotkeys(
        "shift+d",
        () => {
            if (
                _.isEqual(
                    annotationState.dataFocusIndex,
                    annotationState.data.length - 1
                )
            )
                return;
            annotationAction.setStateByKey({
                key: "dataFocusIndex",
                value: ++annotationState.dataFocusIndex,
            });
        },
        {
            scopes: ["single"],
        }
    );
    const ANNOTATOR_NAME_TOOLTIP = {
        annotating: "Annotator",
        reconciling: "Reconciliator (saved under user: reconciliation)",
        verifying: "Verifier",
    };
    const [showSupportDialog, setShowSupportDialog] = useState(false);
    const supportDialogRef = useHotkeys("shift+slash", () =>
        setShowSupportDialog(true)
    );
    const [isSupportTooltipOpen, setIsSupportTooltipOpen] = useState(false);
    const INFO_BAR_DIVIDER = (
        <Divider
            style={{
                display: "inline",
                height: 18,
                margin: "0px 5px",
            }}
        />
    );
    const widgetInitTitle = _.get(MODE_LOOKUP_CODE, widgetMode, "");
    return (
        <div
            tabIndex={-1}
            ref={mergeRefs(
                annotationRef,
                previousDatapointRef,
                nextDatapointRef,
                supportDialogRef
            )}
        >
            <SupportDialog
                showSupportDialog={showSupportDialog}
                setShowSupportDialog={setShowSupportDialog}
            />
            <Navbar
                style={{
                    height: NAV_BAR_HEIGHT,
                    paddingLeft: 20,
                    paddingRight: 20,
                }}
            >
                <NavbarGroup style={{ height: NAV_BAR_HEIGHT }}>
                    <NavbarHeading
                        style={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <H3
                            className={classNames({
                                "margin-0": true,
                                [Classes.SKELETON]: !isInitFinished,
                            })}
                            style={{ marginRight: 5 }}
                        >
                            {title}
                        </H3>
                        <Tooltip
                            isOpen={isSupportTooltipOpen}
                            usePortal={false}
                            content="Support (shift + ?)"
                            placement="right"
                        >
                            <Button
                                onMouseEnter={() =>
                                    setIsSupportTooltipOpen(true)
                                }
                                onMouseLeave={() =>
                                    setIsSupportTooltipOpen(false)
                                }
                                onClick={() => setShowSupportDialog(true)}
                                style={{ padding: 0, marginLeft: 10 }}
                                minimal
                                icon={faIcon({ icon: faQuestionCircle })}
                            />
                        </Tooltip>
                    </NavbarHeading>
                </NavbarGroup>
                <NavbarGroup
                    style={{ height: NAV_BAR_HEIGHT }}
                    align={Alignment.RIGHT}
                >
                    {_.isEqual(view, "table") ? (
                        <div
                            style={{ width: 340 }}
                            className={
                                !isInitFinished ? Classes.SKELETON : null
                            }
                        >
                            <Popover
                                minimal
                                interactionKind={PopoverInteractionKind.CLICK}
                                onInteraction={(state) =>
                                    setIsSearchPopoverOpen(state)
                                }
                                isOpen={isSearchPopoverOpen}
                                className="full-parent-width"
                                position="bottom-left"
                                content={
                                    <div style={{ width: 400 }}>
                                        <SearchPopoverContent
                                            queryString={queryString}
                                            isTyping={isTyping}
                                        />
                                    </div>
                                }
                                autoFocus={false}
                                enforceFocus={false}
                            >
                                <InputGroup
                                    onClick={(event) => {
                                        if (isSearchPopoverOpen)
                                            event.stopPropagation();
                                    }}
                                    value={queryString}
                                    disabled={
                                        annotationState.isIndexingDocuments
                                    }
                                    placeholder={
                                        annotationState.isIndexingDocuments
                                            ? "Indexing records..."
                                            : "Filter..."
                                    }
                                    onChange={(event) => {
                                        setQueryString(event.target.value);
                                        setIsTyping(true);
                                        handleSearchQuery.call(
                                            {},
                                            {
                                                query: event.target.value,
                                                state: annotationState,
                                            }
                                        );
                                    }}
                                    rightElement={
                                        _.isEmpty(queryString)
                                            ? null
                                            : SEARCH_FORMAT_TAGS[
                                                  annotationState.filter.mode
                                              ]
                                    }
                                    leftElement={
                                        annotationState.isIndexingDocuments
                                            ? faIcon({
                                                  icon: faSpinnerThird,
                                                  className: "fa-spin",
                                              })
                                            : faIcon({ icon: faSearch })
                                    }
                                />
                            </Popover>
                        </div>
                    ) : null}
                    {!_.isNil(
                        _.get(annotationState, "ipy_interface.service", null)
                    ) ? (
                        <WidgetMode />
                    ) : null}
                </NavbarGroup>
            </Navbar>
            <Card
                style={{
                    borderRadius: 0,
                    padding: 5,
                    position: "relative",
                    zIndex: 3,
                    height: 40,
                }}
            >
                <div
                    style={{
                        marginLeft: 15,
                        marginRight: 15,
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <div
                        style={{ display: "inline-flex" }}
                        className={!isInitFinished ? Classes.SKELETON : null}
                    >
                        {_.isEqual(view, "single") ? <EditorToolStrip /> : null}
                        {_.isEqual(view, "table") ? (
                            <TableToolStrip
                                dataColumnWidth={_.get(
                                    config,
                                    "data_column_width",
                                    300
                                )}
                            />
                        ) : null}
                    </div>
                    <div
                        style={{ display: "inline-flex" }}
                        className={!isInitFinished ? Classes.SKELETON : null}
                    >
                        {_.isEqual(view, "single") ? (
                            <>
                                <Tooltip
                                    usePortal={false}
                                    content="Previous"
                                    minimal
                                    position="bottom"
                                    disabled={
                                        annotationState.dataFocusIndex <= 0
                                    }
                                >
                                    <Button
                                        disabled={
                                            annotationState.dataFocusIndex <= 0
                                        }
                                        style={{ padding: 0 }}
                                        icon={faIcon({ icon: faArrowLeft })}
                                        minimal
                                        onClick={() =>
                                            annotationAction.setStateByKey({
                                                key: "dataFocusIndex",
                                                value: --annotationState.dataFocusIndex,
                                            })
                                        }
                                    />
                                </Tooltip>
                                <Tooltip
                                    usePortal={false}
                                    content="Next"
                                    minimal
                                    position="bottom"
                                    disabled={_.isEqual(
                                        annotationState.dataFocusIndex,
                                        annotationState.data.length - 1
                                    )}
                                >
                                    <Button
                                        disabled={_.isEqual(
                                            annotationState.dataFocusIndex,
                                            annotationState.data.length - 1
                                        )}
                                        style={{ padding: 0 }}
                                        icon={faIcon({
                                            icon: faArrowRight,
                                        })}
                                        minimal
                                        onClick={() =>
                                            annotationAction.setStateByKey({
                                                key: "dataFocusIndex",
                                                value: ++annotationState.dataFocusIndex,
                                            })
                                        }
                                    />
                                </Tooltip>
                                <Divider />
                            </>
                        ) : null}
                        <ViewConfigurator
                            view={view}
                            isSmartHighlightEnabled={isSmartHighlightEnabled}
                            setIsSmartHighlightEnabled={
                                setIsSmartHighlightEnabled
                            }
                        />
                        <Divider />
                        <ViewSelector
                            view={view}
                            setView={setView}
                            isInitFinished={isInitFinished}
                        />
                    </div>
                </div>
            </Card>
            <div
                ref={containerRef}
                style={{
                    overflow: "hidden",
                    width: "100%",
                    height: height,
                    marginBottom: 31,
                }}
            >
                {isInitFinished ? (
                    <div
                        style={{
                            overflow: "hidden",
                            position: "relative",
                            height: "100%",
                            marginBottom: 1,
                        }}
                    >
                        <Editor
                            currentView={view}
                            setView={setView}
                            smartHighlight={isSmartHighlightEnabled}
                        />
                    </div>
                ) : null}
                {isInitFinished ? (
                    <div style={{ height: "100%" }}>
                        <Table
                            dataColumnWidth={_.get(
                                config,
                                "data_column_width",
                                300
                            )}
                            setView={setView}
                        />
                    </div>
                ) : null}
                {!isInitFinished ? (
                    <LoadingScreen
                        title={`Initializing ${
                            _.isEmpty(widgetInitTitle)
                                ? " "
                                : " " + widgetInitTitle + " "
                        } widget...`}
                        initStages={initStages}
                    />
                ) : null}
            </div>
            <div
                style={{
                    padding: 5,
                    paddingLeft: 20,
                    paddingRight: 20,
                    borderTop: "1px solid lightgray",
                    position: "absolute",
                    bottom: 0,
                    left: 1,
                    right: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Tooltip
                        className="margin-top--1"
                        content={_.get(ANNOTATOR_NAME_TOOLTIP, widgetMode, "-")}
                        minimal
                        usePortal={false}
                        position="top-left"
                    >
                        <Tag
                            className={
                                !isInitFinished ? Classes.SKELETON : null
                            }
                            minimal
                            style={{ marginRight: 10 }}
                        >
                            {_.get(
                                annotationState,
                                "config.annotator.name",
                                DEFAULT_ANNOTATOR.name
                            )}
                        </Tag>
                    </Tooltip>
                    {isInitFinished
                        ? _.isEqual(
                              _.get(annotationState, "data", []).length,
                              _.get(annotationState, "originalData", []).length
                          )
                            ? `${
                                  _.get(annotationState, "data", []).length
                              } showing`
                            : `${
                                  _.get(annotationState, "data", []).length
                              } of ${
                                  _.get(annotationState, "originalData", [])
                                      .length
                              } showing`
                        : null}
                    {annotationState.selectedDatapointIds.size > 0 ? (
                        <>
                            {INFO_BAR_DIVIDER}
                            {`${annotationState.selectedDatapointIds.size} selected`}
                        </>
                    ) : null}

                    {recentlyUpdatedSize > 0 ? (
                        <>
                            {INFO_BAR_DIVIDER}
                            {`${recentlyUpdatedSize} unsaved change${
                                recentlyUpdatedSize > 1 ? "s" : ""
                            }`}
                        </>
                    ) : null}
                    {_.isEqual(
                        annotationState.networkRequests.queued,
                        annotationState.networkRequests.completed
                    ) ? null : (
                        <div
                            style={{
                                display: "inline-flex",
                                marginLeft: 10,
                                marginTop: -2,
                            }}
                            className={
                                !isInitFinished ? Classes.SKELETON : null
                            }
                        >
                            <NetworkRequestProgress />
                        </div>
                    )}
                </div>
                <CompatibilityCheck />
            </div>
        </div>
    );
};
