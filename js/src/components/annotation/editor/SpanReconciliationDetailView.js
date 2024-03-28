import { Tag, Tooltip } from "@blueprintjs/core";
import _ from "lodash";
import { useContext } from "react";
import { labelValueSortedCount } from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
export const SpanReconciliationDetailView = ({
    layer,
    labelName,
    layerIndex,
}) => {
    const { annotationState } = useContext(AnnotationContext);
    const labelValueCounter = () => {
        let valueCount = {},
            totalCount = 0;
        const valueKeys = Object.keys(layer);
        for (let i = 0; i < valueKeys.length; i++) {
            const size = _.get(layer, valueKeys[i], new Set()).size;
            if (_.isUndefined(valueCount[valueKeys[i]]))
                valueCount[valueKeys[i]] = size;
            else valueCount[valueKeys[i]] += size;
            totalCount += size;
        }
        return labelValueSortedCount(valueCount, totalCount);
    };
    const countResult = labelValueCounter();
    return (
        <div
            className="popover-content-view-dimension"
            style={{
                padding: 10,
                lineHeight: "initial",
            }}
        >
            {_.isArray(countResult) ? (
                <div style={{ marginBottom: 10 }}>
                    {countResult.map((curr, index) => {
                        const tagStyle = _.get(
                            annotationState,
                            ["labelTagStyles", labelName, curr.key, "minimal"],
                            {}
                        );
                        return (
                            <Tag
                                minimal
                                key={`span-reconciliation-detail-view-layer-${layerIndex}-tag-${index}`}
                                style={{
                                    ...curr.style,
                                    ...tagStyle,
                                    width: `${curr.percent}%`,
                                }}
                            >
                                <Tooltip
                                    className="full-parent-width"
                                    position="bottom"
                                    content={
                                        <div>
                                            {curr.key}:{" "}
                                            <span
                                                style={{
                                                    fontWeight: "bolder",
                                                }}
                                            >
                                                {curr.percent}% ({curr.value})
                                            </span>
                                        </div>
                                    }
                                >
                                    {
                                        <div>
                                            {curr.key}:{" "}
                                            <span>{curr.percent}%</span>
                                        </div>
                                    }
                                </Tooltip>
                            </Tag>
                        );
                    })}
                </div>
            ) : null}
            {Object.keys(layer).map((value, labelValueIndex) => {
                return (
                    <div
                        key={`span-level-span-text-layer-popover-content-label-value-${labelValueIndex}`}
                    >
                        <table>
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: "top" }}>
                                        <Tag
                                            style={_.get(
                                                annotationState,
                                                [
                                                    "labelTagStyles",
                                                    labelName,
                                                    value,
                                                    "minimal",
                                                ],
                                                {}
                                            )}
                                        >
                                            {value}
                                        </Tag>
                                    </td>
                                    <td style={{ verticalAlign: "top" }}>
                                        {_.toArray(_.get(layer, value, [])).map(
                                            (uid) => (
                                                <div
                                                    key={`span-level-span-text-layer-popover-content-label-user-${uid}`}
                                                >
                                                    <Tag
                                                        minimal
                                                        style={{
                                                            backgroundColor:
                                                                "transparent",
                                                        }}
                                                    >
                                                        {_.get(
                                                            annotationState,
                                                            ["uidMap", uid],
                                                            uid
                                                        )}
                                                    </Tag>
                                                </div>
                                            )
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </div>
    );
};
