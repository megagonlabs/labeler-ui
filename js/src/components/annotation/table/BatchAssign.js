import {
    Button,
    Intent,
    Menu,
    MenuDivider,
    MenuItem,
    Popover,
} from "@blueprintjs/core";
import {
    faCheckDouble,
    faEraser,
    faListCheck,
    faTags,
} from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext } from "react";
import { LABEL_AS_TEXT_MODE_LOOKUP, MODE_LOOKUP_CODE } from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { faIcon } from "../../icon";
export const BatchAssign = ({ column }) => {
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    const currentLabel = _.get(
        annotationState,
        "reconciliation.currentLabel",
        null
    );
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    const confirmOriginal = () => {
        var newReconciliationState = _.cloneDeep(
            annotationState.reconciliation.data
        );
        const uuids = Array.from(
            _.get(annotationState, "selectedDatapointIds", [])
        );
        for (let i = 0; i < uuids.length; i++) {
            const existing_value = _.get(newReconciliationState, [
                uuids[i],
                currentLabel,
                MODE_LOOKUP_CODE[widgetMode],
            ]);
            if (!_.isNil(existing_value)) continue;
            _.set(
                newReconciliationState,
                [uuids[i], currentLabel, MODE_LOOKUP_CODE[widgetMode]],
                _.get(
                    annotationState,
                    [
                        "reconciliation",
                        "data",
                        uuids[i],
                        currentLabel,
                        "verification-readonly",
                    ],
                    null
                )
            );
        }
        annotationAction.setStateByKey({
            key: "reconciliation",
            value: {
                ...annotationState.reconciliation,
                data: newReconciliationState,
            },
        });
        annotationAction.setRecentlyUpdatedStatus({
            state: "updated",
            uuids: uuids,
        });
    };
    return (
        <Popover
            className="full-parent-width"
            minimal
            position="bottom"
            content={
                <Menu>
                    {_.isEqual(widgetMode, "verifying") ? (
                        <MenuItem
                            onClick={confirmOriginal}
                            intent={Intent.SUCCESS}
                            icon={faIcon({ icon: faCheckDouble })}
                            text="Confirm remainder"
                        />
                    ) : null}
                    <MenuDivider
                        title={`${
                            column.tagging
                                ? "Tag"
                                : _.get(
                                      LABEL_AS_TEXT_MODE_LOOKUP,
                                      widgetMode,
                                      "Label"
                                  )
                        } as`}
                    />
                    {_.isEmpty(
                        _.get(
                            annotationState,
                            ["labelNameOptions", column.name],
                            []
                        )
                    ) ? (
                        <MenuItem
                            disabled
                            text={`No ${
                                column.tagging ? "tag" : "label"
                            } option`}
                        />
                    ) : null}
                    {_.get(
                        annotationState,
                        ["labelNameOptions", column.name],
                        []
                    ).map((option, index) => (
                        <MenuItem
                            key={`table-batch-assign-col-${column.name}-menuitem-label-${index}`}
                            onClick={() => {
                                if (
                                    ["reconciling", "verifying"].includes(
                                        widgetMode
                                    )
                                ) {
                                    annotationAction.batchSetReconciliationLabel(
                                        {
                                            type: column.name,
                                            value: option.value,
                                        }
                                    );
                                } else if (
                                    _.isEqual(widgetMode, "annotating")
                                ) {
                                    annotationAction.batchSetRecordLevelLabel({
                                        type: column.name,
                                        value: option.value,
                                    });
                                }
                            }}
                            labelElement={
                                <span style={{ fontWeight: "bolder" }}>
                                    {option.value}
                                </span>
                            }
                            text={option.text}
                        />
                    ))}
                    <MenuDivider />
                    <MenuItem
                        icon={faIcon({ icon: faEraser })}
                        onClick={() => {
                            if (
                                ["reconciling", "verifying"].includes(
                                    widgetMode
                                )
                            ) {
                                annotationAction.batchSetReconciliationLabel({
                                    type: column.name,
                                    value: null,
                                });
                            } else if (_.isEqual(widgetMode, "annotating")) {
                                annotationAction.batchSetRecordLevelLabel({
                                    type: column.name,
                                    value: null,
                                });
                            }
                        }}
                        text="Remove"
                        intent={Intent.DANGER}
                    />
                </Menu>
            }
        >
            <Button
                style={{ marginTop: 1 }}
                disabled={_.isEmpty(annotationState.selectedDatapointIds)}
                minimal
                outlined
                icon={faIcon({
                    icon: column.tagging ? faTags : faListCheck,
                })}
                fill
                text="Bulk edit"
                intent="primary"
            />
        </Popover>
    );
};
