import { Menu, MenuDivider, MenuItem } from "@blueprintjs/core";
import {
    faArrowDown,
    faArrowDown91,
    faArrowDownZA,
    faArrowUp,
    faArrowUp91,
    faArrowUpZA,
    faBadge,
    faCheck,
    faTasks,
} from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext } from "react";
import {
    GREEN_CHECK_COLOR,
    MENU_ITEM_NO_STYLE,
    RECORD_LEVEL_LABEL_OKP,
} from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { faIcon } from "../../icon";
const SORT_ICONS = {
    asc: {
        string: faArrowUpZA,
        number: faArrowUp91,
    },
    desc: {
        string: faArrowDownZA,
        number: faArrowDown91,
    },
};
export const HeaderMenu = ({ column }) => {
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    const currentLabel = _.get(
        annotationState,
        "reconciliation.currentLabel",
        null
    );
    const handleColumnFilterChange = (column, value) => {
        let columnFilter = _.cloneDeep(
            _.get(annotationState, ["filter", "column"], {})
        );
        if (_.has(columnFilter, column)) {
            if (columnFilter[column].includes(value))
                columnFilter[column] = columnFilter[column].filter(
                    (filterValue) => !_.isEqual(filterValue, value)
                );
            else columnFilter[column].push(value);
        } else columnFilter[column] = [value];
        const keys = Object.keys(columnFilter);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (
                Array.isArray(columnFilter[key]) &&
                _.isEmpty(columnFilter[key])
            )
                delete columnFilter[key];
        }
        annotationAction.onFilterChange({
            ...annotationState.filter,
            column: columnFilter,
        });
    };
    const handleSortData = ({
        path,
        desc = false,
        mode = "DIRECT_VALUE",
        type = "string",
        key,
    }) => {
        annotationAction.onFilterChange({
            ...annotationState.filter,
            justSort: true,
            sorter: {
                path: path,
                desc: desc,
                mode: mode,
                type: type,
                key: key,
            },
        });
    };
    if (_.isEqual(column.key, "table-column-last-submitted")) {
        return (
            <Menu>
                <MenuItem
                    onClick={() => handleSortData({ mode: "unverified_first" })}
                    icon={faIcon({ icon: faBadge })}
                    text="Sort unverified first"
                />
                <MenuDivider title="Filter by" />
                <MenuItem
                    style={MENU_ITEM_NO_STYLE}
                    disabled
                    icon={"blank"}
                    onClick={() =>
                        handleColumnFilterChange(column.name, "confirmed")
                    }
                    text="Confirmed"
                />
                <MenuItem
                    style={MENU_ITEM_NO_STYLE}
                    disabled
                    icon={"blank"}
                    onClick={() =>
                        handleColumnFilterChange(column.name, "corrected")
                    }
                    text="Corrected"
                />
                <MenuItem
                    style={MENU_ITEM_NO_STYLE}
                    disabled
                    icon={"blank"}
                    onClick={() =>
                        handleColumnFilterChange(column.name, "unverfied")
                    }
                    text="Unverified"
                />
            </Menu>
        );
    } else if (_.isEqual(column.key, "table-column-checkbox")) {
        return (
            <Menu>
                <MenuItem
                    onClick={() => handleSortData({ mode: "selected_first" })}
                    icon={faIcon({ icon: faTasks })}
                    text="Sort selected first"
                />
                <MenuDivider title="Bulk select" />
                <MenuItem
                    text="Unsaved change(s)"
                    onClick={() => annotationAction.selectRecentlyUpdated()}
                />
                <MenuItem
                    text="With status error"
                    onClick={() =>
                        annotationAction.selectDataWithSubmissionError()
                    }
                />
            </Menu>
        );
    } else if (_.isEqual(column.key, "table-column-data"))
        return (
            <Menu>
                <MenuDivider title={column.name} />
                <MenuItem
                    onClick={() =>
                        handleSortData({
                            path: "record_content",
                            key: column.key,
                        })
                    }
                    icon={faIcon({ icon: SORT_ICONS.asc.string })}
                    text="Sort asc."
                />
                <MenuItem
                    onClick={() =>
                        handleSortData({
                            path: "record_content",
                            desc: true,
                            key: column.key,
                        })
                    }
                    icon={faIcon({
                        icon: SORT_ICONS.desc.string,
                    })}
                    text="Sort desc."
                />
            </Menu>
        );
    else if (
        _.isEqual(widgetMode, "verifying") &&
        _.startsWith(column.key, "table-column-label-metadata-")
    ) {
        return (
            <Menu>
                <MenuDivider title={column.name} />
                <MenuItem
                    text="Sort asc."
                    onClick={() =>
                        handleSortData({
                            path: [currentLabel, column.name],
                            mode: "LABEL_METADATA_VALUE",
                            key: column.key,
                        })
                    }
                    icon={faIcon({ icon: SORT_ICONS.asc.number })}
                />
                <MenuItem
                    text="Sort desc."
                    onClick={() =>
                        handleSortData({
                            desc: true,
                            path: [currentLabel, column.name],
                            mode: "LABEL_METADATA_VALUE",
                            key: column.key,
                        })
                    }
                    icon={faIcon({ icon: SORT_ICONS.desc.number })}
                />
            </Menu>
        );
    } else {
        return (
            <Menu>
                <MenuDivider title={column.name} />
                <MenuItem
                    onClick={() => {
                        if (_.isEqual(widgetMode, "annotating")) {
                            handleSortData({
                                path: [...RECORD_LEVEL_LABEL_OKP, column.name],
                                mode: "LABEL_VALUE",
                                key: column.key,
                            });
                        } else if (
                            ["reconciling", "verifying"].includes(widgetMode)
                        ) {
                            handleSortData({
                                mode: `${widgetMode}${
                                    _.isEqual(
                                        column.key,
                                        "verifying-read-only-focus-label"
                                    )
                                        ? "-readonly"
                                        : ""
                                }`,
                                key: column.key,
                            });
                        }
                    }}
                    icon={faIcon({
                        icon: _.get(
                            SORT_ICONS,
                            ["asc", column.labelOptionType],
                            faArrowUp
                        ),
                    })}
                    text={`Sort asc.`}
                />
                <MenuItem
                    onClick={() => {
                        if (_.isEqual(widgetMode, "annotating")) {
                            handleSortData({
                                path: [...RECORD_LEVEL_LABEL_OKP, column.name],
                                desc: true,
                                mode: "LABEL_VALUE",
                                key: column.key,
                            });
                        } else if (
                            ["reconciling", "verifying"].includes(widgetMode)
                        ) {
                            handleSortData({
                                desc: true,
                                mode: `${widgetMode}${
                                    _.isEqual(
                                        column.key,
                                        "verifying-read-only-focus-label"
                                    )
                                        ? "-readonly"
                                        : ""
                                }`,
                                key: column.key,
                            });
                        }
                    }}
                    icon={faIcon({
                        icon: _.get(
                            SORT_ICONS,
                            ["desc", column.labelOptionType],
                            faArrowDown
                        ),
                    })}
                    text={`Sort desc.`}
                />
                {_.isEmpty(
                    _.get(
                        annotationState,
                        ["labelNameOptions", column.name],
                        []
                    )
                ) ? null : (
                    <MenuDivider title="Filter by" />
                )}
                {_.get(
                    annotationState,
                    ["labelNameOptions", column.name],
                    []
                ).map((option, index) => {
                    return (
                        <MenuItem
                            style={MENU_ITEM_NO_STYLE}
                            key={`table-column-${column.name}-filter-by-menuitem-label-${index}`}
                            onClick={() =>
                                handleColumnFilterChange(
                                    column.name,
                                    option.value
                                )
                            }
                            icon={
                                _.get(
                                    annotationState,
                                    ["filter", "column", column.name],
                                    []
                                ).includes(option.value)
                                    ? faIcon({
                                          icon: faCheck,
                                          style: {
                                              color: GREEN_CHECK_COLOR,
                                          },
                                      })
                                    : "blank"
                            }
                            labelElement={
                                <span
                                    style={{
                                        fontWeight: "bolder",
                                    }}
                                >
                                    {option.value}
                                </span>
                            }
                            text={option.text}
                        />
                    );
                })}
            </Menu>
        );
    }
};
