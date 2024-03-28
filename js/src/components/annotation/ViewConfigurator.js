import {
    Button,
    HTMLSelect,
    Menu,
    MenuDivider,
    MenuItem,
    Popover,
    Switch,
    Tag,
    Tooltip,
} from "@blueprintjs/core";
import { faSlidersH } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect } from "react";
import {
    DEFAULT_LABEL_COLOR_PALETTE,
    DEFAULT_SPAN_HIGHLIGHT_COLOR,
    MENU_ITEM_NO_STYLE,
} from "../constant";
import { AnnotationContext } from "../context/AnnotationContext";
import { faIcon } from "../icon";
export const ViewConfigurator = ({
    isSmartHighlightEnabled,
    setIsSmartHighlightEnabled,
    view,
}) => {
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    const single = _.isEqual(view, "single");
    const table = _.isEqual(view, "table");
    const updateSettingState = (key, value) => {
        annotationAction.setStateByKey({
            key: "settings",
            value: {
                ..._.get(annotationState, "settings", {}),
                [key]: value,
            },
        });
    };
    const hideSpanLabelValue = _.get(
            annotationState,
            "settings.hideSpanLabelValue",
            false
        ),
        showFullMetadataValue = _.get(
            annotationState,
            "settings.showFullMetadataValue",
            false
        ),
        metadataFocusName = _.get(
            annotationState,
            "settings.metadataFocusName",
            ""
        ),
        colorAssist = _.get(annotationState, "settings.colorAssist", false);
    const MENU_ITEM_PROPS = {
        style: MENU_ITEM_NO_STYLE,
        shouldDismissPopover: false,
    };
    useEffect(() => {
        const labelNameOptions = _.get(annotationState, "labelNameOptions", {});
        let labelTagStyles = {};
        const labelNameOptionKeys = Object.keys(labelNameOptions);
        for (let i = 0; i < labelNameOptionKeys.length; i++) {
            const labelNameKey = labelNameOptionKeys[i];
            labelTagStyles[labelNameKey] = {};
            var newLabelOptions = labelNameOptions[labelNameKey];
            for (let j = 0; j < newLabelOptions.length; j++) {
                labelTagStyles[labelNameKey][newLabelOptions[j]["value"]] =
                    DEFAULT_LABEL_COLOR_PALETTE[
                        colorAssist ? "assist" : "normal"
                    ][j % 9];
            }
        }
        if (_.isEmpty(labelTagStyles)) return;
        annotationAction.setStateByKey({
            key: "labelTagStyles",
            value: labelTagStyles,
        });
    }, [colorAssist]);
    return (
        <div>
            <Popover
                usePortal={false}
                minimal
                position="bottom"
                content={
                    <div>
                        <Menu>
                            <MenuDivider title="View" />
                            <MenuItem
                                {...MENU_ITEM_PROPS}
                                onClickCapture={() =>
                                    updateSettingState(
                                        "colorAssist",
                                        !colorAssist
                                    )
                                }
                                icon={
                                    <Switch
                                        checked={colorAssist}
                                        readOnly
                                        className="no-pointer-events margin-0"
                                    />
                                }
                                text="Color assist"
                            />
                            {single ? (
                                <MenuItem
                                    {...MENU_ITEM_PROPS}
                                    onClickCapture={() =>
                                        updateSettingState(
                                            "hideSpanLabelValue",
                                            !hideSpanLabelValue
                                        )
                                    }
                                    icon={
                                        <Switch
                                            checked={hideSpanLabelValue}
                                            readOnly
                                            className="no-pointer-events margin-0"
                                        />
                                    }
                                    text="Hide span label value"
                                    popoverProps={{ position: "left" }}
                                >
                                    <MenuDivider title="Example" />
                                    <div
                                        style={{
                                            margin: "5px 8px",
                                            width: 200,
                                        }}
                                    >
                                        Readability&nbsp;
                                        <span
                                            style={{
                                                position: "relative",
                                                ...DEFAULT_SPAN_HIGHLIGHT_COLOR,
                                            }}
                                        >
                                            text
                                            {!_.get(
                                                annotationState,
                                                "settings.hideSpanLabelValue",
                                                false
                                            ) ? (
                                                <span
                                                    style={{
                                                        position: "absolute",
                                                        left: 0,
                                                        lineHeight: "initial",
                                                        height: 20,
                                                        top: -22.5,
                                                    }}
                                                >
                                                    <Tag minimal>value</Tag>
                                                </span>
                                            ) : null}
                                        </span>
                                        &nbsp;test
                                    </div>
                                </MenuItem>
                            ) : null}
                            {table &&
                            !_.isEmpty(
                                _.get(
                                    annotationState,
                                    "metadataNames",
                                    new Set()
                                )
                            ) ? (
                                <MenuItem
                                    {...MENU_ITEM_PROPS}
                                    onClickCapture={() =>
                                        updateSettingState(
                                            "showFullMetadataValue",
                                            !showFullMetadataValue
                                        )
                                    }
                                    icon={
                                        <Switch
                                            checked={showFullMetadataValue}
                                            readOnly
                                            className="no-pointer-events margin-0"
                                        />
                                    }
                                    text="Show full record metadata value"
                                    popoverProps={{ position: "left" }}
                                >
                                    <MenuDivider title="Record metadata" />
                                    <div style={{ margin: "5px 8px" }}>
                                        <HTMLSelect
                                            fill
                                            value={metadataFocusName}
                                            onChange={(event) =>
                                                updateSettingState(
                                                    "metadataFocusName",
                                                    event.currentTarget.value
                                                )
                                            }
                                        >
                                            <option disabled value="">
                                                -
                                            </option>
                                            {Array.from(
                                                _.get(
                                                    annotationState,
                                                    "metadataNames",
                                                    new Set()
                                                )
                                            ).map((name, index) => (
                                                <option
                                                    key={`view-configurator-metadata-focus-name-${index}`}
                                                    value={name}
                                                >
                                                    {name}
                                                </option>
                                            ))}
                                        </HTMLSelect>
                                    </div>
                                </MenuItem>
                            ) : null}
                            {single ? (
                                <>
                                    <MenuDivider title="Text selection" />
                                    <MenuItem
                                        {...MENU_ITEM_PROPS}
                                        onClickCapture={() =>
                                            setIsSmartHighlightEnabled(
                                                !isSmartHighlightEnabled
                                            )
                                        }
                                        icon={
                                            <Switch
                                                checked={
                                                    isSmartHighlightEnabled
                                                }
                                                readOnly
                                                className="no-pointer-events margin-0"
                                            />
                                        }
                                        text="Smart (word)"
                                    />
                                </>
                            ) : null}
                        </Menu>
                    </div>
                }
            >
                <Tooltip
                    usePortal={false}
                    minimal
                    position="bottom"
                    content="Settings"
                >
                    <Button
                        minimal
                        style={{ padding: 0 }}
                        icon={faIcon({ icon: faSlidersH })}
                    />
                </Tooltip>
            </Popover>
        </div>
    );
};
