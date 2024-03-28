import {
    Button,
    ButtonGroup,
    Callout,
    Divider,
    Menu,
    MenuDivider,
    MenuItem,
    Popover,
    Tag,
    Tooltip,
} from "@blueprintjs/core";
import {
    faCaretDown,
    faCheck,
    faColumns,
    faEraser,
    faFilterList,
    faFilterSlash,
} from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import {
    DEFAULT_COLUMN_STATE,
    FIXED_COLUMN,
    GREEN_CHECK_COLOR,
    HIDDEN_COLUMN_UNDER_RECONCILING,
    LABEL_SCHEMA_OKP,
    MENU_ITEM_NO_STYLE,
    RECORD_LEVEL_SCHEMA_KEY,
} from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { faIcon } from "../../icon";
import { SaveButton } from "../SaveButton";
export const TableToolStrip = ({ dataColumnWidth }) => {
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    const [columnFilterInfo, setColumnFilterInfo] = useState([]);
    const [enableResetFilter, setEnableResetFilter] = useState(false);
    const label_meta_columns = _.uniq(
        _.get(annotationState, "config.label_meta_names", [])
    );
    useEffect(() => {
        let shouldEnableResetFilter = false;
        const columnFilter = _.get(annotationState, ["filter", "column"], {});
        const columnFilterKeys = Object.keys(columnFilter);
        for (let i = 0; i < columnFilterKeys.length; i++) {
            const columnFilterKey = columnFilterKeys[i];
            if (
                Array.isArray(columnFilter[columnFilterKey]) &&
                columnFilter[columnFilterKey].length > 0
            )
                shouldEnableResetFilter = true;
        }
        setEnableResetFilter(shouldEnableResetFilter);
        if (!_.isNil(annotationState.filter.column)) {
            var tempColumnFilterInfo = [];
            const filterKeys = Object.keys(annotationState.filter.column);
            for (let i = 0; i < filterKeys.length; i++) {
                const filterKey = filterKeys[i];
                tempColumnFilterInfo.push(
                    `${filterKey} with "${_.get(
                        annotationState,
                        ["filter", "column", filterKey],
                        []
                    ).join('", "')}"`
                );
            }
            setColumnFilterInfo(tempColumnFilterInfo);
        } else {
            setColumnFilterInfo([]);
        }
    }, [annotationState.filter]);
    const verifying_column_keys = [
        ...label_meta_columns.map(
            (col) => `table-column-label-metadata-${col}`
        ),
        "verifying-read-only-focus-label",
    ];
    const toggleColumnState = (columnKey) => {
        const state = _.get(annotationState, ["columns", widgetMode], []);
        var currentColumnState = _.cloneDeep(state);
        for (let i = 0; i < currentColumnState.length; i++) {
            if (_.isEqual(currentColumnState[i].key, columnKey)) {
                const nextValue = !currentColumnState[i].visible;
                if (["reconciling", "verifying"].includes(widgetMode)) {
                    if (!nextValue) continue;
                    const columnLabelName = currentColumnState[i].name;
                    if (nextValue && !_.isNil(columnLabelName)) {
                        annotationAction.setStateByKey({
                            key: "reconciliation",
                            value: {
                                ...annotationState.reconciliation,
                                currentLabel: columnLabelName,
                            },
                        });
                    }
                }
                currentColumnState[i].visible = nextValue;
            } else if (
                ["reconciling", "verifying"].includes(widgetMode) &&
                !_.includes(
                    Object.keys(DEFAULT_COLUMN_STATE),
                    currentColumnState[i].key
                ) &&
                !_.includes(verifying_column_keys, currentColumnState[i].key)
            )
                currentColumnState[i].visible = false;
        }
        annotationAction.setStateByKey({
            key: "columns",
            value: {
                ...annotationState.columns,
                [widgetMode]: currentColumnState,
            },
        });
    };
    const resetColumnState = () => {
        var newColumnState = _.cloneDeep(DEFAULT_COLUMN_STATE);
        _.set(newColumnState, "table-column-data.width", dataColumnWidth);
        const labelSchemas = _.get(annotationState, LABEL_SCHEMA_OKP, []);
        for (let i = 0; i < labelSchemas.length; i++) {
            const schema = labelSchemas[i];
            if (!_.isEqual(schema.level, RECORD_LEVEL_SCHEMA_KEY)) continue;
            newColumnState[`table-column-${schema.name}`] = {
                order: Object.keys(newColumnState).length,
                width: 150,
            };
        }
        annotationAction.setStateByKey({
            key: "columns",
            value: {
                ...annotationState.columns,
                [widgetMode]: _.get(
                    annotationState,
                    ["columns", widgetMode],
                    []
                )
                    .sort(
                        (a, b) =>
                            _.get(newColumnState, [a.key, "order"]) -
                            _.get(newColumnState, [b.key, "order"])
                    )
                    .map((column) => {
                        column.visible = !_.isEqual(
                            column.key,
                            "table-column-reconciliation-summary"
                        )
                            ? true
                            : false;
                        column.width = _.get(
                            newColumnState,
                            [column.key, "width"],
                            150
                        );
                        column.order = _.get(
                            newColumnState,
                            [column.key, "order"],
                            150
                        );
                        return column;
                    }),
            },
        });
    };
    return (
        <ButtonGroup>
            {_.get(annotationState, "hasSubmit", false) ? (
                <>
                    <SaveButton />
                    <Divider />
                </>
            ) : null}
            <Popover
                disabled={!enableResetFilter}
                minimal
                position="bottom-left"
                usePortal={false}
                content={
                    <div style={{ maxWidth: 400 }}>
                        {columnFilterInfo.length > 0 ? (
                            <div
                                style={{
                                    margin: "5px 11px 10px",
                                    padding: "5px 5px 0px",
                                }}
                            >
                                <Tag minimal>Filtering on</Tag>
                                <div style={{ padding: "0px 6px" }}>
                                    {columnFilterInfo
                                        .map((element) => (
                                            <span>{element}</span>
                                        ))
                                        .reduce((prev, curr) => [
                                            prev,
                                            <br />,
                                            curr,
                                        ])}
                                </div>
                            </div>
                        ) : null}
                        <Menu style={{ paddingTop: 0 }}>
                            <MenuDivider />
                            <MenuItem
                                icon={faIcon({ icon: faEraser })}
                                text="Reset filters"
                                intent="danger"
                                onClick={() => {
                                    annotationAction.onFilterChange({
                                        query: annotationState.filter.query,
                                    });
                                }}
                            />
                        </Menu>
                    </div>
                }
            >
                <Tooltip
                    disabled={!enableResetFilter}
                    minimal
                    usePortal={false}
                    position="bottom"
                    content="Filters"
                >
                    <Button
                        disabled={!enableResetFilter}
                        minimal
                        icon={faIcon({
                            icon: enableResetFilter
                                ? faFilterList
                                : faFilterSlash,
                        })}
                        rightIcon={faIcon({ icon: faCaretDown })}
                    />
                </Tooltip>
            </Popover>
            <Divider />
            <Popover
                position="bottom-left"
                minimal
                usePortal={false}
                content={
                    <div>
                        <Menu>
                            <MenuDivider title="Column Visibility" />
                            {_.get(
                                annotationState,
                                ["columns", widgetMode],
                                []
                            ).map((column, index) => {
                                const conditions = [
                                    _.isUndefined(column.name),
                                    _.includes(FIXED_COLUMN, column.key),
                                    _.includes(
                                        verifying_column_keys,
                                        column.key
                                    ),
                                    ["reconciling", "verifying"].includes(
                                        widgetMode
                                    ) &&
                                        (column.tagging ||
                                            _.includes(
                                                HIDDEN_COLUMN_UNDER_RECONCILING,
                                                column.key
                                            )),
                                ];
                                if (!_.isEmpty(conditions.filter(Boolean)))
                                    return null;
                                return (
                                    <MenuItem
                                        style={MENU_ITEM_NO_STYLE}
                                        key={`table-tool-strip-column-visibility-col-${index}`}
                                        shouldDismissPopover={
                                            !_.isEqual(widgetMode, "annotating")
                                        }
                                        onClick={() =>
                                            toggleColumnState(column.key)
                                        }
                                        icon={
                                            column.visible
                                                ? faIcon({
                                                      icon: faCheck,
                                                      style: {
                                                          color: GREEN_CHECK_COLOR,
                                                      },
                                                  })
                                                : "blank"
                                        }
                                        text={column.name}
                                    />
                                );
                            })}
                            {_.isEqual(widgetMode, "annotating") ? (
                                <>
                                    <MenuDivider />
                                    <MenuItem
                                        intent="danger"
                                        icon={faIcon({ icon: faEraser })}
                                        text="Reset Columns"
                                        onClick={resetColumnState}
                                    />
                                </>
                            ) : null}
                            {["reconciling", "verifying"].includes(
                                widgetMode
                            ) ? (
                                <Callout
                                    style={{
                                        marginTop: 5,
                                        maxWidth: 270,
                                        padding: 10,
                                    }}
                                    intent="primary"
                                    icon={null}
                                >
                                    Only 1 label column can be shown at a time
                                    under this editor mode.
                                </Callout>
                            ) : null}
                        </Menu>
                    </div>
                }
            >
                <Tooltip
                    content="Columns"
                    minimal
                    position="bottom"
                    usePortal={false}
                >
                    <Button
                        minimal
                        icon={faIcon({ icon: faColumns })}
                        style={{ padding: 0 }}
                    />
                </Tooltip>
            </Popover>
        </ButtonGroup>
    );
};
