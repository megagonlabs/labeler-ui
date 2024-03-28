import { Classes, Colors, Popover, Tag } from "@blueprintjs/core";
import classNames from "classnames";
import { findAll } from "highlight-words-core";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import {
    DEFAULT_SPAN_HIGHLIGHT_COLOR,
    EXPANDABLE_CHARS,
    HEX_TRANSPARENCY,
    LABEL_SCHEMA_OKP,
    SPAN_LEVEL_CHAR_SCHEMA_KEY,
    SPAN_LEVEL_LABELS_KEY,
} from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { OptionList } from "../OptionList";
import { SpanReconciliationDetailView } from "./SpanReconciliationDetailView";
const SPAN_LEVEL_LABEL_OKP = ["annotation_list", 0, SPAN_LEVEL_LABELS_KEY];
const DEFAULT_LABEL_COLOR = {
    minimal: {
        backgroundColor: `${Colors.DARK_GRAY3}${HEX_TRANSPARENCY[15]}`,
        color: Colors.DARK_GRAY2,
    },
    regular: {
        backgroundColor: Colors.DARK_GRAY3,
        color: Colors.WHITE,
    },
};
export const SpanLevel = ({
    rowIndex,
    mode,
    isInPopover,
    smartHighlight,
    isTableCell,
    focusLabel,
    scrollParentElement,
}) => {
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    const [labelName, setLabelName] = useState(null);
    const isEdit = _.isEqual(mode, "edit");
    const labelSchemas = _.get(annotationState, LABEL_SCHEMA_OKP, []);
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    useEffect(() => {
        for (let i = 0; i < labelSchemas.length; i++) {
            const schema = labelSchemas[i];
            if (_.isEqual(schema.level, SPAN_LEVEL_CHAR_SCHEMA_KEY)) {
                setLabelName(schema.name);
                break;
            }
        }
    }, [labelSchemas]);
    useEffect(() => {
        if (oldSelection != null) {
            let autoAssignLabel = {
                label_name: labelName,
                start_idx: oldSelection.start,
                end_idx: oldSelection.end,
                label_level: "span",
            };
            _.set(autoAssignLabel, "label_value", [focusLabel.value]);
            annotationAction.setNewLabel({
                path: [SPAN_LEVEL_LABELS_KEY],
                label: autoAssignLabel,
            });
            annotationAction.setRecentlyUpdatedStatus({
                state: "updated",
                uuids: [datapoint.uuid],
            });
            setOldSelection(null);
        }
    }, [focusLabel]);
    const isAlpha = (char) => {
        return /[a-z]/i.test(char);
    };
    const [datapoint, setDatapoint] = useState({});
    useEffect(() => {
        setDatapoint(
            _.cloneDeep(_.get(annotationState, ["data", rowIndex], {}))
        );
    }, [annotationState.data, rowIndex]);
    const [nodes, setNodes] = useState(null);
    const [selection, setSelection] = useState(null);
    const [oldSelection, setOldSelection] = useState(null);
    useEffect(() => {
        setNodes(null);
        annotationRenderer();
    }, [
        datapoint,
        selection,
        annotationState.reconciliation.data,
        annotationState.labelTagStyles,
    ]);
    const text = _.get(datapoint, "record_content", "");
    const annotationHighlighter = () => {
        const elementSelection = window.getSelection();
        if (
            _.isNil(elementSelection) ||
            _.isNil(elementSelection.anchorNode) ||
            _.isNil(elementSelection.focusNode)
        )
            return;
        let { anchorNode: startNode, focusNode: endNode } = elementSelection;
        // startNode and endNode are text itself; parentsNodes for <span> element
        if (!_.isNil(startNode.parentNode)) startNode = startNode.parentNode;
        if (!_.isNil(endNode.parentNode)) endNode = endNode.parentNode;
        const childNodes = Array.prototype.slice.call(
            document.getElementById("span-level-text-content-nodes").childNodes
        );
        const startNodeIndex = childNodes.indexOf(
                startNode.closest(".span-level-span-text-nodes")
            ),
            endNodeIndex = childNodes.indexOf(
                endNode.closest(".span-level-span-text-nodes")
            ),
            startOffset = elementSelection.anchorOffset,
            endOffset = elementSelection.focusOffset;
        if (
            _.isEqual(startNodeIndex, endNodeIndex) &&
            _.isEqual(startOffset, endOffset)
        )
            return;
        const selectionRange = [startNodeIndex, endNodeIndex].sort(
            (a, b) => a - b
        );
        const substringText = text.substring(
            selectionRange[0],
            selectionRange[1] + 1
        );
        if (_.isEmpty(substringText.trim()) || _.includes(substringText, "\n"))
            return;
        // SMART HIGHLIGHT LOGIC [BEGIN]
        const canExpand = (char) => {
            return isAlpha(char) || EXPANDABLE_CHARS.includes(char);
        };
        // trim white-space
        var smartStartIndex = selectionRange[0],
            smartEndIndex = selectionRange[1];
        while (
            smartStartIndex < smartEndIndex &&
            _.isEqual(text[smartStartIndex], " ")
        )
            smartStartIndex += 1;
        while (
            smartEndIndex > smartStartIndex &&
            _.isEqual(text[smartEndIndex], " ")
        )
            smartEndIndex -= 1;
        // expand to cover word
        while (smartStartIndex - 1 >= 0 && canExpand(text[smartStartIndex - 1]))
            smartStartIndex -= 1;
        while (
            smartEndIndex + 1 < text.length &&
            canExpand(text[smartEndIndex + 1])
        )
            smartEndIndex += 1;
        if (smartHighlight) {
            selectionRange[0] = smartStartIndex;
            selectionRange[1] = smartEndIndex;
        }
        // SMART HIGHLIGHT LOGIC [END]
        // end_index is exclusive
        selectionRange[1] += 1;
        const existingLabels = _.get(datapoint, SPAN_LEVEL_LABEL_OKP, []);
        let hasOverlapLabel = false;
        for (let i = 0; i < existingLabels.length; i++) {
            const label = existingLabels[i];
            if (
                label.start_idx <= selectionRange[1] - 1 &&
                label.end_idx - 1 >= selectionRange[0]
            )
                hasOverlapLabel = true;
        }
        if (hasOverlapLabel) setSelection(null);
        else if (!_.isNil(focusLabel)) {
            let autoAssignLabel = {
                label_name: labelName,
                start_idx: selectionRange[0],
                end_idx: selectionRange[1],
                label_level: "span",
            };
            _.set(autoAssignLabel, "label_value", [focusLabel.value]);
            annotationAction.setNewLabel({
                path: [SPAN_LEVEL_LABELS_KEY],
                label: autoAssignLabel,
            });
            annotationAction.setRecentlyUpdatedStatus({
                state: "updated",
                uuids: [datapoint.uuid],
            });
        } else
            setSelection({
                start: selectionRange[0],
                end: selectionRange[1],
            });
    };
    const annotationRenderer = () => {
        let labels = _.get(datapoint, SPAN_LEVEL_LABEL_OKP, []);
        const DATA_TARGET_PATH = ["reconciliation", "data", datapoint.uuid];
        if (_.isEqual(widgetMode, "reconciling")) {
            const reconData = _.get(annotationState, DATA_TARGET_PATH, null);
            if (_.isNil(reconData)) labels = [];
            else labels = _.get(reconData, [labelName, "reconciliation"], []);
        }
        let nodes = [],
            labelIndexes = new Set(),
            labelIndexesMapping = {},
            startTagIndexes = new Set();
        for (let i = 0; i < labels.length; i++) {
            const start_idx = labels[i].start_idx,
                end_idx = labels[i].end_idx;
            const numbers = _.range(start_idx, end_idx, 1);
            for (let j = 0; j < numbers.length; j++) {
                labelIndexes.add(numbers[j]);
                labelIndexesMapping[numbers[j]] = labels[i];
                if (_.isEqual(numbers[j], start_idx))
                    startTagIndexes.add(numbers[j]);
            }
        }
        for (let i = 0; i < text.length; i++) {
            let node = { content: text[i], type: "text", layers: [] };
            if (labelIndexes.has(i)) {
                const labelStyle = _.get(
                    annotationState,
                    [
                        "labelTagStyles",
                        labelIndexesMapping[i].label_name,
                        labelIndexesMapping[i].label_value,
                        "minimal",
                    ],
                    DEFAULT_LABEL_COLOR.minimal
                );
                node.type = "label";
                node.labelStyle = labelStyle;
                node.tag = startTagIndexes.has(i);
                node.attr = { ...labelIndexesMapping[i], label_level: "span" };
            } else if (!_.isNil(selection)) {
                if (selection.start <= i && i < selection.end) {
                    node.type = "selection";
                    node.attr = {
                        start_idx: selection.start,
                        end_idx: selection.end,
                        label_level: "span",
                    };
                    node.labelStyle = DEFAULT_SPAN_HIGHLIGHT_COLOR;
                }
            }
            nodes.push(node);
        }
        if (_.isEqual(widgetMode, "reconciling")) {
            const recon_label_spans = _.get(
                annotationState,
                [...DATA_TARGET_PATH, labelName, "reconciliation_label_spans"],
                []
            );
            const MAX_LEVEL = 11;
            var occupied_level = new Set(),
                level = MAX_LEVEL,
                endPositions = {};
            for (let i = 0; i < text.length; i++) {
                const remove_levels = _.get(endPositions, "+" + i, []);
                delete endPositions[i];
                for (let j = 0; j < remove_levels.length; j++) {
                    occupied_level.delete(remove_levels[j]);
                }
                for (let j = 0; j < recon_label_spans.length; j++) {
                    if (recon_label_spans[j].start_idx != i) continue;
                    for (let k = 0; k < MAX_LEVEL; k++) {
                        if (!occupied_level.has(k)) {
                            level = k;
                            break;
                        }
                    }
                    occupied_level.add(level);
                    let start = recon_label_spans[j].start_idx,
                        end = recon_label_spans[j].end_idx;
                    while (start < end && start < nodes.length) {
                        _.set(
                            nodes,
                            [start, "layers", level],
                            _.get(recon_label_spans, [j, "labels"], {})
                        );
                        start++;
                    }
                    let end_position_levels = _.get(
                        endPositions,
                        "+" + end,
                        []
                    );
                    _.set(endPositions, "+" + end, [
                        ...end_position_levels,
                        level,
                    ]);
                }
            }
        }
        // locate highlight words
        const chunks = findAll({
            searchWords: annotationState.filter.highlightWords,
            textToHighlight: text,
        });
        let indexToHighlight = new Set();
        for (let i = 0; i < chunks.length; i++) {
            if (chunks[i].highlight) {
                const numbers = _.range(chunks[i].start, chunks[i].end, 1);
                for (let j = 0; j < numbers.length; j++) {
                    indexToHighlight.add(numbers[j]);
                }
            }
        }
        for (let i = 0; i < nodes.length; i++) {
            _.set(nodes[i], "highlight", indexToHighlight.has(i));
            // popover start node for selection text
            _.set(
                nodes[i],
                "popover",
                !_.isNil(selection) && _.isEqual(selection.start, i)
            );
            const layers = nodes[i].layers;
            for (let j = 0; j < layers.length; j++) {
                if (_.isUndefined(layers[j])) layers[j] = null;
            }
        }
        window.getSelection().removeAllRanges();
        setNodes(nodes);
    };
    if (_.isNil(nodes))
        return (
            <div
                style={{
                    lineHeight: isEdit ? "36px" : "24px",
                    marginTop: isEdit || isInPopover ? 0 : 7.5,
                }}
                className={Classes.SKELETON}
            >
                {datapoint.record_content}
            </div>
        );
    return (
        <div
            style={
                isTableCell
                    ? {
                          width: "max-content",
                          marginTop: 9.5,
                          lineHeight: "20px",
                      }
                    : null
            }
        >
            <div
                id="span-level-text-content-nodes"
                className={isEdit ? Classes.TEXT_LARGE : null}
                style={{
                    lineHeight: isEdit
                        ? `${
                              _.get(
                                  annotationState,
                                  "settings.hideSpanLabelValue",
                                  false
                              )
                                  ? 36
                                  : 49
                          }px`
                        : isInPopover
                        ? "24px"
                        : null,
                    whiteSpace: isEdit || isInPopover ? "pre-wrap" : null,
                    marginTop:
                        !_.get(
                            annotationState,
                            "settings.hideSpanLabelValue",
                            false
                        ) && !isInPopover
                            ? 7.5
                            : null,
                }}
                onMouseUp={
                    isEdit && ["annotating", "reconciling"].includes(widgetMode)
                        ? annotationHighlighter
                        : null
                }
            >
                {nodes.map((node, index) => {
                    const labelValue = _.get(node, "attr.label_value.0", "-");
                    const contentSpan = (
                        <span style={{ fontFamily: "monospace, monospace" }}>
                            {node.content}
                        </span>
                    );
                    return (
                        <span
                            className="span-level-span-text-nodes"
                            key={`span-level-span-text-${index}`}
                            style={{
                                ...(_.isEqual(widgetMode, "reconciling") &&
                                isEdit &&
                                !_.includes(node.content, "\n")
                                    ? {
                                          display: "inline-flex",
                                          flexDirection: "column",
                                      }
                                    : {}),
                            }}
                        >
                            <span
                                className={classNames({
                                    "search-words-highlight": node.highlight,
                                })}
                                style={{
                                    position: "relative",
                                    cursor: !isEdit
                                        ? null
                                        : _.isEqual(node.type, "label")
                                        ? "pointer"
                                        : "text",
                                    ..._.get(node, "labelStyle", {}),
                                }}
                            >
                                {_.includes(
                                    ["selection", "label"],
                                    node.type
                                ) && isEdit ? (
                                    <Popover
                                        isOpen={
                                            _.isEqual(node.type, "selection") &&
                                            node.popover
                                                ? true
                                                : null
                                        }
                                        placement="bottom-start"
                                        onClose={() => setSelection(null)}
                                        content={
                                            <OptionList
                                                attr={node.attr}
                                                schemaLevel={
                                                    SPAN_LEVEL_CHAR_SCHEMA_KEY
                                                }
                                                labelName={labelName}
                                                rowIndex={rowIndex}
                                            />
                                        }
                                    >
                                        {contentSpan}
                                    </Popover>
                                ) : (
                                    contentSpan
                                )}
                                {node.tag &&
                                isEdit &&
                                !_.get(
                                    annotationState,
                                    "settings.hideSpanLabelValue",
                                    false
                                ) ? (
                                    <span
                                        className="user-select-none"
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            lineHeight: "initial",
                                            height: 20,
                                            top: -23.5,
                                        }}
                                    >
                                        <Tag minimal>{labelValue}</Tag>
                                    </span>
                                ) : null}
                            </span>
                            {isEdit &&
                                _.get(node, "layers", []).map(
                                    (layer, layerIndex) => {
                                        const layerStyle = {
                                            backgroundColor: Colors.GRAY5,
                                            height: 8,
                                            marginBottom: 4,
                                            visibility: _.isNil(layer)
                                                ? "hidden"
                                                : "visible",
                                        };
                                        if (_.isNil(layer)) {
                                            return (
                                                <span
                                                    className="user-select-none"
                                                    key={`span-level-span-text-layer-${layerIndex}`}
                                                    style={layerStyle}
                                                >
                                                    &nbsp;
                                                </span>
                                            );
                                        }
                                        return (
                                            <Popover
                                                className="user-select-none"
                                                key={`span-level-span-text-layer-${layerIndex}`}
                                                boundary={scrollParentElement}
                                                targetProps={{
                                                    style: {
                                                        ...layerStyle,
                                                        cursor: "pointer",
                                                    },
                                                    className:
                                                        "user-select-none",
                                                }}
                                                usePortal={false}
                                                placement="bottom"
                                                content={
                                                    <SpanReconciliationDetailView
                                                        layer={layer}
                                                        layerIndex={layerIndex}
                                                        labelName={labelName}
                                                    />
                                                }
                                            >
                                                <span>&nbsp;</span>
                                            </Popover>
                                        );
                                    }
                                )}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};
