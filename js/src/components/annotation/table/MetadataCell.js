import {
    Callout,
    Popover,
    PopoverInteractionKind,
    Tag,
} from "@blueprintjs/core";
import _ from "lodash";
import { useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnnotationContext } from "../../context/AnnotationContext";
import { DoubleClickPopover } from "./DoubleClickPopover";
export const MetadataCell = ({ rowIndex }) => {
    const { annotationState } = useContext(AnnotationContext);
    const metadata = _.get(
        annotationState,
        ["data", rowIndex, "record_metadata"],
        []
    );
    const showFullMetadataValue = _.get(
            annotationState,
            "settings.showFullMetadataValue",
            false
        ),
        metadataFocusName = _.get(
            annotationState,
            "settings.metadataFocusName",
            null
        );
    const MarkdownRenderer = ({ value }) => {
        return (
            <ReactMarkdown
                className="react-markdown-content"
                remarkPlugins={[remarkGfm]}
            >
                {value || ""}
            </ReactMarkdown>
        );
    };
    return (
        <DoubleClickPopover
            shouldShowPopoverButton={!_.isEmpty(metadata)}
            content={
                <div
                    className="popover-content-view-dimension"
                    style={{ overflowY: "scroll", padding: 10 }}
                    onWheelCapture={(event) => event.stopPropagation()}
                >
                    {metadata.map((data, index) => {
                        if (
                            _.isNil(_.get(data, "name", null)) ||
                            _.isNil(_.get(data, "value", null))
                        )
                            return null;
                        return (
                            <Callout
                                style={{
                                    marginBottom:
                                        index + 1 < metadata.length ? 10 : 0,
                                    backgroundColor: "#f6f7f9",
                                }}
                                key={`metadata-detailed-view-row-${rowIndex}-${index}`}
                                title={data.name}
                            >
                                <MarkdownRenderer
                                    key={`metadata-detailed-view-markdown-${rowIndex}-${index}`}
                                    value={data.value}
                                />
                            </Callout>
                        );
                    })}
                </div>
            }
            target={
                <div
                    style={{
                        overflow: "hidden",
                        width: "calc(100% - 34px)",
                        height: 39,
                    }}
                >
                    {_.isEmpty(metadata) ||
                    (showFullMetadataValue &&
                        (_.isEmpty(metadataFocusName) ||
                            _.isNil(metadataFocusName)))
                        ? "-"
                        : metadata.map((data, index) => {
                              if (showFullMetadataValue) {
                                  if (_.isEqual(data.name, metadataFocusName)) {
                                      if (
                                          _.isNil(_.get(data, "name", null)) ||
                                          _.isNil(_.get(data, "value", null))
                                      )
                                          return "-";
                                      return (
                                          <MarkdownRenderer
                                              key={`metadata-focus-view-markdown-${rowIndex}-${index}`}
                                              value={data.value}
                                          />
                                      );
                                  } else return null;
                              }
                              if (
                                  _.isNil(_.get(data, "name", null)) ||
                                  _.isNil(_.get(data, "value", null))
                              )
                                  return null;
                              return (
                                  <Popover
                                      key={`metadata-cell-popover-row-${rowIndex}-${index}`}
                                      minimal
                                      interactionKind={
                                          PopoverInteractionKind.HOVER_TARGET_ONLY
                                      }
                                      position="top-left"
                                      content={
                                          <div
                                              className="popover-content-view-dimension"
                                              style={{
                                                  padding: 10,
                                                  overflowY: "hidden",
                                              }}
                                          >
                                              <MarkdownRenderer
                                                  key={`metadata-hover-view-markdown-${rowIndex}-${index}`}
                                                  value={data.value}
                                              />
                                          </div>
                                      }
                                  >
                                      <Tag
                                          style={{ marginRight: 5 }}
                                          minimal
                                          key={`metadata-cell-tag-row-${rowIndex}-${index}`}
                                      >
                                          {data.name}
                                      </Tag>
                                  </Popover>
                              );
                          })}
                </div>
            }
        />
    );
};
