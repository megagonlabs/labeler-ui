import { Button, Card, Colors, H4, NonIdealState } from "@blueprintjs/core";
import { faFolderOpen } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { Sticky, StickyContainer } from "react-sticky";
import {
    LABEL_SCHEMA_OKP,
    SPAN_LEVEL_CHAR_SCHEMA_KEY,
    TAG_SCHEMA_OKP,
} from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { faIcon } from "../../icon";
import { MetadataViewer } from "./MetadataViewer";
import { PersistentLabelSelection } from "./PersistentLabellSelection";
import { RecordLevel } from "./RecordLevel";
import { SpanLevel } from "./SpanLevel";
import { Tagging } from "./Tagging";
export const Editor = ({ setView, smartHighlight }) => {
    const { annotationState } = useContext(AnnotationContext);
    const labelSchemas = _.get(annotationState, LABEL_SCHEMA_OKP, []);
    const [labelOptions, setLabelOptions] = useState([]);
    const [labelName, setLabelName] = useState(null);
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    useEffect(() => {
        let labelOptions = [];
        for (let i = 0; i < labelSchemas.length; i++) {
            const schema = labelSchemas[i];
            if (_.isEqual(schema.level, SPAN_LEVEL_CHAR_SCHEMA_KEY)) {
                setLabelName(schema.name);
                labelOptions = schema.options;
                break;
            }
        }
        setLabelOptions(labelOptions);
    }, [labelSchemas]);
    const isRecordLevelVisible =
        labelSchemas.filter((schema) =>
            _.isEqual(_.get(schema, "level", null), "record")
        ).length > 0 && _.isEqual(widgetMode, "annotating");
    const [focusLabel, setFocusLabel] = useState(null);
    const stickyHeaderRenderer = ({ isSticky, style, content }) => (
        <div
            style={{
                ...style,
                padding: "10px 20px",
                width: "100%",
                zIndex: 1,
                left: 0,
                height: 42,
                ...(isSticky
                    ? {
                          position: "absolute",
                          borderBottom: "1px solid lightgray",
                          backgroundColor: Colors.WHITE,
                      }
                    : {
                          position: "initial",
                          backgroundColor: "transparent",
                      }),
            }}
        >
            {content}
        </div>
    );
    const [scrollParentElement, setScrollParentElement] = useState(null);
    const centerScroll = (overflowingDiv) => {
        setScrollParentElement(overflowingDiv);
        if (!_.isNil(overflowingDiv)) {
            // if we don't requestAnimationFrame, this function apparently executes
            // before styles are applied to the page, so the centering is way off.
            requestAnimationFrame(() => {
                const container = overflowingDiv;
                container.scrollLeft =
                    overflowingDiv.clientWidth / 2 - container.clientWidth / 2;
                container.scrollTop =
                    overflowingDiv.clientHeight / 2 -
                    container.clientHeight / 2;
            });
        }
    };
    return (
        <div
            style={{ overflow: "hidden", position: "relative", height: "100%" }}
        >
            {_.isEqual(annotationState.dataFocusIndex, -1) ? (
                <NonIdealState
                    icon={faIcon({ icon: faFolderOpen, size: 30 })}
                    title="Oops! No data available."
                    description={
                        <span>
                            Try modifying or clearing search in Table view to
                            see records here.
                        </span>
                    }
                    action={
                        <Button
                            minimal
                            outlined
                            intent="primary"
                            text="Go to Table view"
                            onClick={() => setView("table")}
                        />
                    }
                />
            ) : (
                <div
                    style={{
                        overflow: "hidden",
                        position: "relative",
                        height: "100%",
                    }}
                >
                    {isRecordLevelVisible ? (
                        <Card
                            interactive
                            style={{
                                zIndex: 2,
                                height: "100%",
                                position: "absolute",
                                right: 0,
                                overflow: "auto",
                                width: 300,
                                borderRadius: 0,
                            }}
                        >
                            <RecordLevel
                                rowIndex={annotationState.dataFocusIndex}
                            />
                        </Card>
                    ) : null}
                    <div
                        style={{
                            overflow: "hidden",
                            position: "relative",
                            height: "100%",
                            width: `calc(100% - ${
                                isRecordLevelVisible ? 300 : 0
                            }px)`,
                        }}
                    >
                        <StickyContainer
                            className="overscroll-behavior-contain"
                            style={{
                                padding: "10px 0px 20px",
                                overflowY: "auto",
                                height: "100%",
                            }}
                        >
                            <Sticky relative topOffset={0}>
                                {({ style, isSticky }) =>
                                    stickyHeaderRenderer({
                                        content: (
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "nowrap",
                                                    height: 22,
                                                }}
                                            >
                                                <H4 className="margin-0 margin-right-10">
                                                    {_.isEmpty(labelOptions)
                                                        ? "Data"
                                                        : "Labels"}
                                                </H4>
                                                <div
                                                    className="hide-scrollbar full-parent-width"
                                                    style={{
                                                        display: "flex",
                                                        flexWrap: "nowrap",
                                                        overflowX: "auto",
                                                    }}
                                                >
                                                    <PersistentLabelSelection
                                                        labelName={labelName}
                                                        labelOptions={
                                                            labelOptions
                                                        }
                                                        focusLabel={focusLabel}
                                                        setFocusLabel={
                                                            setFocusLabel
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ),
                                        isSticky: isSticky,
                                        style: style,
                                    })
                                }
                            </Sticky>
                            <div
                                ref={centerScroll}
                                style={{
                                    marginLeft: 20,
                                    marginRight: 20,
                                }}
                            >
                                {_.isEqual(widgetMode, "reconciling") ? null : (
                                    <SpanLevel
                                        scrollParentElement={
                                            scrollParentElement
                                        }
                                        focusLabel={focusLabel}
                                        smartHighlight={smartHighlight}
                                        mode="edit"
                                        rowIndex={
                                            annotationState.dataFocusIndex
                                        }
                                    />
                                )}
                            </div>
                            {!_.isEmpty(
                                _.get(
                                    annotationState,
                                    `data.${annotationState.dataFocusIndex}.metadata`,
                                    []
                                )
                            ) ? (
                                <>
                                    <Sticky relative topOffset={-31}>
                                        {({ style, isSticky }) =>
                                            stickyHeaderRenderer({
                                                content: (
                                                    <div>
                                                        <H4 className="margin-0">
                                                            Metadata
                                                        </H4>
                                                    </div>
                                                ),
                                                isSticky: isSticky,
                                                style: style,
                                            })
                                        }
                                    </Sticky>
                                    <div
                                        style={{
                                            marginLeft: 20,
                                            marginRight: 20,
                                        }}
                                    >
                                        <MetadataViewer />
                                    </div>
                                </>
                            ) : null}
                            {!_.isEmpty(
                                _.get(annotationState, TAG_SCHEMA_OKP, [])
                            ) ? (
                                <>
                                    <Sticky relative topOffset={-31}>
                                        {({ style, isSticky }) =>
                                            stickyHeaderRenderer({
                                                content: (
                                                    <div>
                                                        <H4 className="margin-0">
                                                            Tags
                                                        </H4>
                                                    </div>
                                                ),
                                                isSticky: isSticky,
                                                style: style,
                                            })
                                        }
                                    </Sticky>
                                    <div
                                        style={{
                                            marginLeft: 20,
                                            marginRight: 20,
                                        }}
                                    >
                                        <Tagging />
                                    </div>
                                </>
                            ) : null}
                        </StickyContainer>
                    </div>
                </div>
            )}
        </div>
    );
};
