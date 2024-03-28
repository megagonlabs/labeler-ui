import {
    Colors,
    Intent,
    Popover,
    PopoverInteractionKind,
    Tag,
    Tooltip,
} from "@blueprintjs/core";
import {
    faCheckDouble,
    faCircleSmall,
    faUserSlash,
} from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import TimeAgo from "react-timeago";
import { SUBMISSION_STATE_ICON } from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { faIcon } from "../../icon";
const VERIFICATION_STATUS_ICON = {
    CORRECTS: {
        icon: faUserSlash,
        intent: Intent.WARNING,
        text: "Correction",
    },
    CONFIRMS: {
        icon: faCheckDouble,
        intent: Intent.SUCCESS,
        text: "Confirmation",
    },
};
export const SubmissionStatusCell = ({ rowIndex }) => {
    const { annotationState } = useContext(AnnotationContext);
    const [submitState, setSubmitState] = useState(null);
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    const uuid = _.get(annotationState, ["data", rowIndex, "uuid"], null);
    const recentlyUpdatedDataIds = _.get(
        annotationState,
        "recentlyUpdatedDataIds",
        new Set()
    );
    const updated = recentlyUpdatedDataIds.has(uuid);
    const currentLabel = _.get(
        annotationState,
        "reconciliation.currentLabel",
        null
    );
    useEffect(() => {
        if (_.isNil(uuid)) setSubmitState(null);
        else {
            let newState = _.get(
                annotationState,
                ["submissionAudit", uuid],
                null
            );
            setSubmitState(newState);
        }
    }, [annotationState.submissionAudit]);
    if (updated) {
        return (
            <div style={{ textAlign: "center" }}>
                <Tooltip
                    content={
                        <div style={{ maxWidth: 400 }}>Unsaved change(s)</div>
                    }
                    minimal
                    position="bottom-left"
                >
                    {faIcon({
                        icon: faCircleSmall,
                        style: { color: Colors.BLUE3, opacity: 0.75 },
                    })}
                </Tooltip>
            </div>
        );
    }
    if (_.isNil(submitState)) {
        if (_.isEqual(widgetMode, "verifying")) {
            const verificationHistory = _.get(
                annotationState,
                ["verificationHistory", currentLabel, uuid],
                []
            );
            if (!_.isEmpty(verificationHistory)) {
                return (
                    <div style={{ textAlign: "center" }}>
                        <Popover
                            content={
                                <div
                                    className="popover-content-view-dimension"
                                    style={{
                                        overflowY: "scroll",
                                        padding: 10,
                                        paddingBottom: 6.75,
                                    }}
                                    onWheelCapture={(event) =>
                                        event.stopPropagation()
                                    }
                                >
                                    <table>
                                        <tbody>
                                            {verificationHistory.map(
                                                (item, index) => {
                                                    const labelValue = _.get(
                                                        item,
                                                        "labels.0.label_value.0",
                                                        null
                                                    );
                                                    const tagStyle = _.get(
                                                        annotationState,
                                                        [
                                                            "labelTagStyles",
                                                            currentLabel,
                                                            labelValue,
                                                            "minimal",
                                                        ],
                                                        {}
                                                    );
                                                    return (
                                                        <tr
                                                            key={`verification-history-${rowIndex}-${index}`}
                                                        >
                                                            <td
                                                                style={{
                                                                    paddingTop:
                                                                        index >
                                                                        0
                                                                            ? 0.5
                                                                            : 0,
                                                                }}
                                                            >
                                                                <Tag
                                                                    minimal
                                                                    className="margin-right-5"
                                                                    intent={
                                                                        VERIFICATION_STATUS_ICON[
                                                                            item
                                                                                .verification_status
                                                                        ].intent
                                                                    }
                                                                    icon={faIcon(
                                                                        {
                                                                            icon: VERIFICATION_STATUS_ICON[
                                                                                item
                                                                                    .verification_status
                                                                            ]
                                                                                .icon,
                                                                        }
                                                                    )}
                                                                >
                                                                    {
                                                                        VERIFICATION_STATUS_ICON[
                                                                            item
                                                                                .verification_status
                                                                        ].text
                                                                    }
                                                                </Tag>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    paddingTop:
                                                                        index >
                                                                        0
                                                                            ? 0.5
                                                                            : 0,
                                                                }}
                                                            >
                                                                <span className="margin-right-5">
                                                                    {_.get(
                                                                        annotationState,
                                                                        [
                                                                            "uidMap",
                                                                            item.verifier,
                                                                        ],
                                                                        item.verifier
                                                                    )}
                                                                </span>
                                                            </td>
                                                            <td
                                                                style={{
                                                                    paddingTop:
                                                                        index >
                                                                        0
                                                                            ? 0.5
                                                                            : 0,
                                                                }}
                                                            >
                                                                {!_.isNil(
                                                                    labelValue
                                                                ) ? (
                                                                    <Tag
                                                                        minimal
                                                                        style={
                                                                            tagStyle
                                                                        }
                                                                    >
                                                                        {
                                                                            labelValue
                                                                        }
                                                                    </Tag>
                                                                ) : (
                                                                    "-"
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            }
                            minimal
                            position="bottom-left"
                            interactionKind={
                                PopoverInteractionKind.HOVER_TARGET_ONLY
                            }
                        >
                            {faIcon({
                                icon: _.get(
                                    SUBMISSION_STATE_ICON,
                                    "verified.icon",
                                    null
                                ),
                                style: _.get(
                                    SUBMISSION_STATE_ICON,
                                    "verified.style",
                                    {}
                                ),
                            })}
                        </Popover>
                    </div>
                );
            }
        }
        return null;
    }
    return (
        <div style={{ textAlign: "center" }}>
            <Tooltip
                content={
                    <div style={{ maxWidth: 400 }}>
                        Saved <TimeAgo date={submitState.timestamp} />
                        <br />
                        {submitState.message}
                    </div>
                }
                minimal
                position="bottom-left"
            >
                {faIcon({
                    icon: _.get(
                        SUBMISSION_STATE_ICON,
                        [submitState.state, "icon"],
                        null
                    ),
                    style: _.get(
                        SUBMISSION_STATE_ICON,
                        [submitState.state, "style"],
                        {}
                    ),
                })}
            </Tooltip>
        </div>
    );
};
