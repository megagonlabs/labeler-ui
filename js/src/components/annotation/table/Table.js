import { Button, Popover, PopoverInteractionKind } from "@blueprintjs/core";
import {
    Cell,
    Column,
    ColumnHeaderCell,
    SelectionModes,
    Table2,
    Utils,
} from "@blueprintjs/table";
import { HeaderCell } from "@blueprintjs/table/lib/esm/headers/headerCell";
import { faAngleDown } from "@fortawesome/pro-duotone-svg-icons";
import classNames from "classnames";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import {
    DEFAULT_COLUMN_CELL_ATTR,
    DEFAULT_ROW_HEIGHT,
    FIXED_COLUMN,
    LABEL_SCHEMA_OKP,
    RECORD_LEVEL_SCHEMA_KEY,
    notebook_call,
    python_error_toast,
} from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { faIcon } from "../../icon";
import { SpanLevel } from "../editor/SpanLevel";
import { ActionCheckbox } from "./ActionCheckbox";
import { BatchAssign } from "./BatchAssign";
import { BulkActionCheckbox } from "./BulkActionCheckbox";
import { ColumnSorterIndicator } from "./ColumnSorterIndicator";
import { HeaderMenu } from "./HeaderMenu";
import { HighlightCell } from "./HighlightCell";
import { LabelMetadataCell } from "./LabelMetadataCell";
import { MetadataCell } from "./MetadataCell";
import { NoSearchResult } from "./NoSearchResult";
import { ReconciliationSummaryCell } from "./ReconciliationSummaryCell";
import { RecordLevelColumnCellContent } from "./RecordLevelColumnCellContent";
import { SubmissionStatusCell } from "./SubmissionStatusCell";
import { SubmissionStatusLegend } from "./SubmissionStatusLegend";
export const Table = ({ setView, dataColumnWidth }) => {
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    const [tableKey, setTableKey] = useState(new Date().getTime());
    const DEFAULT_ROW_HEIGHT_PX = DEFAULT_ROW_HEIGHT + "px";
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    const currentLabel = _.get(
        annotationState,
        "reconciliation.currentLabel",
        null
    );
    const record_meta_names = _.uniq(
        _.get(annotationState, "config.record_meta_names", [])
    );
    useEffect(() => {
        // force table to re-render
        setTableKey(new Date().getTime());
    }, [annotationState.filter, widgetMode, annotationState.columns]);
    const MIN_COLUMN_WIDTH = 55;
    const INITIAL_COLUMNS = [
        {
            ...DEFAULT_COLUMN_CELL_ATTR,
            key: "table-column-last-submitted",
            visible: true,
            width: MIN_COLUMN_WIDTH,
            headerMenu: _.isEqual(widgetMode, "verifying"),
            cellRenderer: ({ rowIndex }) => {
                return <SubmissionStatusCell rowIndex={rowIndex} />;
            },
        },
        {
            key: "table-column-checkbox",
            visible: true,
            cellStyle: {
                lineHeight: DEFAULT_ROW_HEIGHT_PX,
                marginLeft: 5,
            },
            width: MIN_COLUMN_WIDTH,
            headerMenu: true,
            cellRenderer: ({ rowIndex }) => {
                return <ActionCheckbox rowIndex={rowIndex} />;
            },
        },
        {
            ...DEFAULT_COLUMN_CELL_ATTR,
            key: "table-column-data",
            visible: true,
            name: "Record Content",
            width: dataColumnWidth,
            headerMenu: true,
            cellRenderer: ({ rowIndex }) => (
                <Popover
                    key={`table-row-data-popover-${rowIndex}`}
                    className="full-parent-width"
                    position="top-left"
                    minimal
                    interactionKind={PopoverInteractionKind.HOVER_TARGET_ONLY}
                    content={
                        <div
                            className="popover-content-view-dimension"
                            style={{
                                padding: 10,
                                overflow: "hidden",
                            }}
                        >
                            <SpanLevel
                                isInPopover={true}
                                mode="view"
                                rowIndex={rowIndex}
                            />
                        </div>
                    }
                >
                    <div
                        onDoubleClick={() => {
                            if (["annotating"].includes(widgetMode)) {
                                annotationAction.setStateByKey({
                                    key: "dataFocusIndex",
                                    value: rowIndex,
                                });
                                setView("single");
                            }
                        }}
                        style={{ overflow: "hidden", height: "100%" }}
                    >
                        <SpanLevel
                            isTableCell={true}
                            mode="view"
                            rowIndex={rowIndex}
                        />
                    </div>
                </Popover>
            ),
        },
    ];
    useEffect(() => {
        var newColumns = _.cloneDeep(INITIAL_COLUMNS);
        const labelSchemas = _.get(annotationState, LABEL_SCHEMA_OKP, []);
        var numOfVisibleColumns = 0;
        for (let i = 0; i < labelSchemas.length; i++) {
            const schema = labelSchemas[i];
            if (!_.isEqual(schema.level, RECORD_LEVEL_SCHEMA_KEY)) continue;
            var labelOptionType = null;
            for (let j = 0; j < schema.options.length; j++) {
                const option = schema.options[j];
                labelOptionType = typeof option.value;
            }
            var visibility = true;
            if (["reconciling", "verifying"].includes(widgetMode)) {
                if (numOfVisibleColumns >= 1 || schema.tagging)
                    visibility = false;
                if (visibility) {
                    annotationAction.setStateByKey({
                        key: "reconciliation",
                        value: {
                            ...annotationState.reconciliation,
                            currentLabel: schema.name,
                        },
                    });
                }
            }
            numOfVisibleColumns += 1;
            newColumns.push({
                ...DEFAULT_COLUMN_CELL_ATTR,
                key: `table-column-${schema.name}`,
                visible: visibility,
                name: schema.name,
                headerMenu: true,
                batchAssign: true,
                labelColumn: true,
                tagging: schema.tagging,
                labelOptionType: labelOptionType,
                cellRenderer: ({ rowIndex }) => (
                    <RecordLevelColumnCellContent
                        rowIndex={rowIndex}
                        labelName={schema.name}
                    />
                ),
            });
        }
        newColumns.push({
            ...DEFAULT_COLUMN_CELL_ATTR,
            key: "table-column-record-metadata-popover-view",
            visible: _.size(record_meta_names) > 0,
            width: 300,
            name: "Record Metadata",
            headerMenu: false,
            cellRenderer: ({ rowIndex }) => (
                <MetadataCell rowIndex={rowIndex} />
            ),
        });
        newColumns.push({
            ...DEFAULT_COLUMN_CELL_ATTR,
            key: "table-column-reconciliation-summary",
            visible: _.isEqual(widgetMode, "reconciling"),
            width: 300,
            headerMenu: false,
            cellRenderer: ({ rowIndex }) => (
                <ReconciliationSummaryCell rowIndex={rowIndex} />
            ),
        });
        let verifying_columns = _.cloneDeep(newColumns);
        if (_.isEqual(widgetMode, "verifying")) {
            verifying_columns.splice(INITIAL_COLUMNS.length, 0, {
                ...DEFAULT_COLUMN_CELL_ATTR,
                key: "verifying-read-only-focus-label",
                visible: true,
                width: 100,
                name: "(Label)",
                headerMenu: true,
                cellRenderer: ({ rowIndex }) => (
                    <RecordLevelColumnCellContent
                        rowIndex={rowIndex}
                        readonly={true}
                    />
                ),
            });
            const label_meta_columns = _.uniq(
                _.get(annotationState, "config.label_meta_names", [])
            );
            for (let i = 0; i < label_meta_columns.length; i++) {
                const key = label_meta_columns[i];
                verifying_columns.push({
                    ...DEFAULT_COLUMN_CELL_ATTR,
                    key: `table-column-label-metadata-${key}`,
                    visible: true,
                    width: 100,
                    name: key,
                    headerMenu: true,
                    columnSearch: true,
                    cellRenderer: ({ rowIndex }) => (
                        <LabelMetadataCell
                            rowIndex={rowIndex}
                            metadataKey={key}
                        />
                    ),
                });
            }
        }
        annotationAction.setStateByKey({
            key: "columns",
            value: {
                ...annotationState.columns,
                annotating: newColumns,
                reconciling: newColumns,
                verifying: verifying_columns,
            },
        });
    }, [annotationState.config.label_schema]);
    useEffect(() => {
        var newColumns = _.cloneDeep(
            _.get(annotationState, ["columns", widgetMode], null)
        );
        if (_.isNil(newColumns)) return;
        for (let i = 0; i < newColumns.length; i++) {
            if (
                _.isEqual(
                    newColumns[i].key,
                    "table-column-reconciliation-summary"
                )
            ) {
                newColumns[i].visible = _.isEqual(widgetMode, "reconciling");
                break;
            }
        }
        if (_.isEqual(widgetMode, "reconciling")) {
            for (let i = 0; i < newColumns.length; i++) {
                if (
                    !_.isNil(newColumns[i].name) &&
                    !_.includes(FIXED_COLUMN, newColumns[i].key)
                )
                    newColumns[i].visible = false;
            }
            for (let i = 0; i < newColumns.length; i++) {
                if (
                    (!_.isNil(currentLabel) &&
                        _.isEqual(newColumns[i].name, currentLabel)) ||
                    (_.isNil(currentLabel) &&
                        !_.isNil(newColumns[i].name) &&
                        !_.includes(FIXED_COLUMN, newColumns[i].key))
                ) {
                    annotationAction.setStateByKey({
                        key: "reconciliation",
                        value: {
                            ...annotationState.reconciliation,
                            currentLabel: newColumns[i].name,
                        },
                    });
                    newColumns[i].visible = true;
                    break;
                }
            }
        }
        annotationAction.setStateByKey({
            key: "columns",
            value: {
                ...annotationState.columns,
                [widgetMode]: newColumns,
            },
        });
    }, [widgetMode]);
    useEffect(() => {
        fetchReconciliationAnnotations();
        mapVerificationAnnotations();
    }, [annotationState.data]);
    useEffect(() => {
        const verifyingId = _.get(annotationState, "verifyingId", null);
        if (
            !_.isEqual(widgetMode, "verifying") ||
            _.isNil(currentLabel) ||
            _.isNil(verifyingId)
        )
            return;
        const get_verification_annotations_command = `MegannoSubset.${_.get(
            annotationState,
            "ipy_interface.subset"
        )}.get_verification_annotations(label_level='record', label_name='${currentLabel}', annotator='${verifyingId}')`;
        notebook_call(
            get_verification_annotations_command,
            _.get(annotationState, "ipy_interface.kernel_id")
        ).then((result) =>
            annotationAction.setVerificationHistory({
                list: JSON.parse(result),
                label: currentLabel,
            })
        );
    }, [currentLabel]);
    const mapVerificationAnnotations = () => {
        if (!_.isEqual(widgetMode, "verifying")) return;
        var uuids = _.get(annotationState, "data", []).map(
            (element) => element.uuid
        );
        if (_.isEmpty(uuids)) return;
        annotationAction.mapVerificationLabels();
    };
    const fetchReconciliationAnnotations = () => {
        if (!_.isEqual(widgetMode, "reconciling")) return;
        var uuids = _.get(annotationState, "data", []).map(
            (element) => element.uuid
        );
        if (_.isEmpty(uuids)) return;
        const batchLimit = 45;
        for (let i = 0; i < uuids.length; i++) {
            var idsToFetch = [],
                counter = 0;
            while (i < uuids.length && counter < batchLimit) {
                counter++;
                idsToFetch.push(uuids[i++]);
            }
            i--;
            const get_reconciliation_data_command = `MegannoSubset.${_.get(
                annotationState,
                "ipy_interface.service"
            )}.get_reconciliation_data(uuid_list=['${idsToFetch.join(
                "','"
            )}'])`;
            notebook_call(
                get_reconciliation_data_command,
                _.get(annotationState, "ipy_interface.kernel_id")
            )
                .then((result) => {
                    annotationAction.buildReconciliationMap(JSON.parse(result));
                })
                .catch((error) => {
                    python_error_toast({
                        code: get_reconciliation_data_command,
                        message: "Unable to get reconciliation data.",
                        error: error,
                    });
                });
        }
    };
    if (
        _.isEmpty(_.get(annotationState, "data", [])) &&
        !_.isEmpty(annotationState.filter.query)
    )
        return <NoSearchResult />;
    return (
        <Table2
            selectionModes={SelectionModes.NONE}
            key={tableKey}
            numRows={_.get(annotationState, "data", []).length + 1}
            defaultRowHeight={DEFAULT_ROW_HEIGHT + 1}
            numFrozenColumns={Math.min(
                _.get(annotationState, ["columns", widgetMode], []).length,
                3
            )}
            numFrozenRows={1}
            enableRowResizing={false}
            enableColumnReordering
            columnWidths={_.get(annotationState, ["columns", widgetMode], [])
                .filter((column) => column.visible)
                .filter((column) => {
                    return (
                        !_.isEqual(widgetMode, "reconciling") || !column.tagging
                    );
                })
                .map((column) => (column.width ? column.width : 150))}
            minColumnWidth={MIN_COLUMN_WIDTH}
            onColumnWidthChanged={(index, size) => {
                var actualIndex = index;
                const columns = _.get(
                    annotationState,
                    ["columns", widgetMode],
                    []
                );
                for (let i = 0; i < columns.length; i++) {
                    var isHidden =
                        !columns[i].visible ||
                        (_.isEqual(widgetMode, "reconciling") &&
                            columns[i].tagging);
                    if (isHidden) {
                        if (actualIndex >= i) actualIndex += 1;
                    }
                }
                annotationAction.setStateByKey({
                    key: "columns",
                    value: {
                        ...annotationState.columns,
                        [widgetMode]: columns.map((column, columnIndex) => {
                            if (_.isEqual(columnIndex, actualIndex))
                                column.width = size;
                            return column;
                        }),
                    },
                });
            }}
            onColumnsReordered={(oldIndex, newIndex, length) => {
                var actualOldIndex = oldIndex,
                    actualNewIndex = newIndex;
                var columns = _.cloneDeep(
                    _.get(annotationState, ["columns", widgetMode], [])
                );
                for (let i = 0; i < columns.length; i++) {
                    var isHidden =
                        !columns[i].visible ||
                        (_.isEqual(widgetMode, "reconciling") &&
                            columns[i].tagging);
                    if (isHidden) {
                        if (actualOldIndex >= i) actualOldIndex += 1;
                        if (actualNewIndex >= i) actualNewIndex += 1;
                    }
                }
                if (_.isEqual(actualOldIndex, actualNewIndex)) return;
                const newColumns = Utils.reorderArray(
                    columns,
                    actualOldIndex,
                    actualNewIndex,
                    length
                );
                annotationAction.setStateByKey({
                    key: "columns",
                    value: {
                        ...annotationState.columns,
                        [widgetMode]: newColumns,
                    },
                });
            }}
            rowHeaderCellRenderer={(rowIndex) => {
                return (
                    <HeaderCell>
                        <div
                            className="bp5-table-row-name"
                            style={{
                                textAlign: "center",
                                minWidth: 40,
                                lineHeight: DEFAULT_ROW_HEIGHT_PX,
                            }}
                        >
                            {_.isEqual(rowIndex, 0) ? null : rowIndex}
                        </div>
                    </HeaderCell>
                );
            }}
        >
            {_.get(annotationState, ["columns", widgetMode], [])
                .filter((column) => column.visible)
                .filter((column) => {
                    return (
                        _.isEqual(widgetMode, "reconciling") || !column.tagging
                    );
                })
                .map((column, index) => {
                    const isDataColumn = _.isEqual(
                            column.key,
                            "table-column-data"
                        ),
                        isMetadataColumn = _.isEqual(
                            column.key,
                            "table-column-record-metadata-popover-view"
                        ),
                        isLabelColumn = _.get(column, "labelColumn", false);
                    return (
                        <Column
                            key={`table-column-${column.key}-col-${index}`}
                            columnHeaderCellRenderer={() => (
                                <ColumnHeaderCell
                                    key={`table-column-header-cell-${column.key}`}
                                    className="column-header-initial-pointer-event"
                                    nameRenderer={() => (
                                        <div
                                            title={column.name}
                                            style={{
                                                paddingRight: column.headerMenu
                                                    ? 24
                                                    : 10,
                                                marginTop: 1,
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            <ColumnSorterIndicator
                                                column={column}
                                            />
                                            {_.isNil(column.name) ? (
                                                <span>&nbsp;</span>
                                            ) : (
                                                <strong
                                                    style={{
                                                        fontWeight:
                                                            !isLabelColumn
                                                                ? "initial"
                                                                : null,
                                                    }}
                                                >
                                                    {column.name}
                                                </strong>
                                            )}
                                            {column.headerMenu ? (
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        right: 10,
                                                        top: -1,
                                                    }}
                                                >
                                                    <Popover
                                                        placement="bottom"
                                                        content={
                                                            <HeaderMenu
                                                                column={column}
                                                            />
                                                        }
                                                    >
                                                        <Button
                                                            small
                                                            minimal
                                                            style={{
                                                                marginTop: 1,
                                                            }}
                                                            icon={faIcon({
                                                                icon: faAngleDown,
                                                            })}
                                                        />
                                                    </Popover>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                />
                            )}
                            cellRenderer={(rowIndex) => {
                                if (_.isEqual(rowIndex, 0)) {
                                    return (
                                        <Cell>
                                            <div
                                                style={{
                                                    height: 38,
                                                    display: "flex",
                                                    alignItems: "center",
                                                }}
                                            >
                                                {_.isEqual(
                                                    column.key,
                                                    "table-column-checkbox"
                                                ) ? (
                                                    <div
                                                        style={{
                                                            marginLeft: 5,
                                                        }}
                                                    >
                                                        <BulkActionCheckbox />
                                                    </div>
                                                ) : null}
                                                {_.isEqual(
                                                    column.key,
                                                    "table-column-last-submitted"
                                                ) ? (
                                                    <div
                                                        style={{
                                                            margin: "auto",
                                                        }}
                                                    >
                                                        <SubmissionStatusLegend />
                                                    </div>
                                                ) : null}
                                                {column.batchAssign ? (
                                                    <BatchAssign
                                                        column={column}
                                                    />
                                                ) : null}
                                            </div>
                                        </Cell>
                                    );
                                }
                                const padding =
                                    isDataColumn || isMetadataColumn
                                        ? false
                                        : true;
                                return (
                                    <Cell style={{ padding: 0 }}>
                                        <HighlightCell
                                            padding={padding}
                                            rowIndex={rowIndex - 1}
                                        >
                                            <div
                                                className={classNames({
                                                    "table-cell-highlight-on-hover":
                                                        isDataColumn,
                                                    "table-cell-metadata":
                                                        isMetadataColumn,
                                                })}
                                                style={{
                                                    ...column.cellStyle,
                                                    ...(isDataColumn ||
                                                    isMetadataColumn
                                                        ? {
                                                              padding: `0px ${
                                                                  isMetadataColumn
                                                                      ? 9
                                                                      : 10
                                                              }px`,
                                                          }
                                                        : {}),
                                                }}
                                            >
                                                {column.cellRenderer.call(
                                                    {},
                                                    { rowIndex: rowIndex - 1 }
                                                )}
                                            </div>
                                        </HighlightCell>
                                    </Cell>
                                );
                            }}
                        />
                    );
                })}
        </Table2>
    );
};
