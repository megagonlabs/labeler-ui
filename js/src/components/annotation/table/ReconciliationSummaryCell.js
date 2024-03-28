import { Classes, HTMLTable, Tag, Tooltip } from "@blueprintjs/core";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { DEFAULT_ROW_HEIGHT, labelValueSortedCount } from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { DoubleClickPopover } from "./DoubleClickPopover";
export const ReconciliationSummaryCell = ({ rowIndex }) => {
    const { annotationState } = useContext(AnnotationContext);
    const [targetContent, setTargetContent] = useState(null);
    const currentLabel = _.get(
        annotationState,
        "reconciliation.currentLabel",
        null
    );
    useEffect(() => {
        const uuid = _.get(annotationState, ["data", rowIndex, "uuid"], null);
        if (!_.isNil(currentLabel) && !_.isNil(uuid)) {
            const reconData = _.get(
                annotationState,
                ["reconciliation", "data", uuid],
                undefined
            );
            if (_.isUndefined(reconData)) setTargetContent(null);
            else setTargetContent(_.get(reconData, currentLabel, {}));
        } else setTargetContent({});
    }, [annotationState.reconciliation]);
    const labelValueCounter = () => {
        if (_.isNil(targetContent)) return null;
        const targetKeys = Object.keys(targetContent);
        var valueCount = {},
            totalCount = 0;
        for (let i = 0; i < targetKeys.length; i++) {
            if (_.isEqual(targetKeys[i], "reconciliation")) continue;
            const labelValue = _.get(targetContent, [targetKeys[i], 0], null);
            if (_.isNil(labelValue)) continue;
            totalCount += 1;
            if (_.isUndefined(valueCount[labelValue]))
                valueCount[labelValue] = 1;
            else valueCount[labelValue] += 1;
        }
        return labelValueSortedCount(valueCount, totalCount);
    };
    const countResult = labelValueCounter();
    return (
        <DoubleClickPopover
            shouldShowPopoverButton={!_.isEmpty(targetContent)}
            content={
                <div
                    className="popover-content-view-dimension"
                    style={{ overflowY: "scroll", padding: 4.5 }}
                    onWheelCapture={(event) => event.stopPropagation()}
                >
                    {_.isEmpty(targetContent) ? null : (
                        <HTMLTable compact>
                            <thead>
                                <tr>
                                    <th>Label</th>
                                    <th>Annotator / Agent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(targetContent).map(
                                    (uid, index) => {
                                        const cellStyle =
                                            index > 0
                                                ? { paddingTop: 0 }
                                                : null;
                                        if (
                                            _.isEmpty(targetContent[uid]) ||
                                            _.isEqual(uid, "reconciliation")
                                        )
                                            return null;
                                        return (
                                            <tr
                                                key={`reconciliation-summary-cell-table-row-${rowIndex}-${uid}`}
                                            >
                                                <td style={cellStyle}>
                                                    {targetContent[uid].map(
                                                        (label) => {
                                                            const tagStyle =
                                                                _.get(
                                                                    annotationState,
                                                                    [
                                                                        "labelTagStyles",
                                                                        currentLabel,
                                                                        label,
                                                                        "minimal",
                                                                    ],
                                                                    {}
                                                                );
                                                            return (
                                                                <Tag
                                                                    key={`reconciliation-summary-cell-detail-row-${rowIndex}-${uid}`}
                                                                    minimal
                                                                    style={
                                                                        tagStyle
                                                                    }
                                                                >
                                                                    {label}
                                                                </Tag>
                                                            );
                                                        }
                                                    )}
                                                </td>
                                                <td style={cellStyle}>
                                                    <span
                                                        style={{
                                                            lineHeight: "20px",
                                                        }}
                                                    >
                                                        {_.get(
                                                            annotationState,
                                                            ["uidMap", uid],
                                                            uid
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </HTMLTable>
                    )}
                </div>
            }
            target={
                <div
                    className={_.isNil(targetContent) ? Classes.SKELETON : null}
                    style={{
                        height: _.isNil(targetContent)
                            ? 20
                            : DEFAULT_ROW_HEIGHT,
                        display: "inline-flex",
                        lineHeight: DEFAULT_ROW_HEIGHT + "px",
                        alignItems: "center",
                        overflow: "hidden",
                        width: `calc(100% - ${
                            _.isNil(targetContent) ? 0 : 34
                        }px)`,
                    }}
                >
                    {_.isEmpty(targetContent) || !_.isArray(countResult)
                        ? "-"
                        : countResult.map((curr, index) => {
                              const tagStyle = _.get(
                                  annotationState,
                                  [
                                      "labelTagStyles",
                                      currentLabel,
                                      curr.key,
                                      "minimal",
                                  ],
                                  {}
                              );
                              return (
                                  <Tag
                                      minimal
                                      key={`reconciliation-summary-cell-row-${rowIndex}-stats-tag-${index}`}
                                      style={{
                                          ...curr.style,
                                          ...tagStyle,
                                          width: `${curr.percent}%`,
                                      }}
                                  >
                                      <Tooltip
                                          className="full-parent-width"
                                          position="top"
                                          content={
                                              <div>
                                                  {curr.key}:{" "}
                                                  <span
                                                      style={{
                                                          fontWeight: "bolder",
                                                      }}
                                                  >
                                                      {curr.percent}% (
                                                      {curr.value})
                                                  </span>
                                              </div>
                                          }
                                      >
                                          <div>
                                              {curr.key}:{" "}
                                              <span>{curr.percent}%</span>
                                          </div>
                                      </Tooltip>
                                  </Tag>
                              );
                          })}
                </div>
            }
        />
    );
};
