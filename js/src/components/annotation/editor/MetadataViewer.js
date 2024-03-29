import { Callout } from "@blueprintjs/core";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AnnotationContext } from "../../context/AnnotationContext";
export const MetadataViewer = () => {
    const { annotationState } = useContext(AnnotationContext);
    const record_meta_names = new Set(
        _.uniq(_.get(annotationState, "config.record_meta_names", []))
    );
    const [metadata, setMetadata] = useState([]);
    useEffect(() => {
        setMetadata(
            _.get(
                annotationState,
                ["data", annotationState.dataFocusIndex, "record_metadata"],
                []
            )
        );
    }, [annotationState.data, annotationState.dataFocusIndex]);
    return (
        <div>
            {metadata.map((data, index) => {
                if (
                    _.isNil(_.get(data, "name", null)) ||
                    _.isNil(_.get(data, "value", null)) ||
                    !record_meta_names.has(_.get(data, "name", null))
                )
                    return null;
                return (
                    <Callout
                        key={`metadata-viewer-callout-row-${index}`}
                        style={{
                            marginBottom: index + 1 < metadata.length ? 10 : 0,
                            backgroundColor: "#f6f7f9",
                        }}
                        title={data.name}
                    >
                        <ReactMarkdown
                            className="react-markdown-content"
                            remarkPlugins={[remarkGfm]}
                        >
                            {data.value || ""}
                        </ReactMarkdown>
                    </Callout>
                );
            })}
        </div>
    );
};
