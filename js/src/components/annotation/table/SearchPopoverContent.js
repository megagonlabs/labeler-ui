import {
    Button,
    Classes,
    Code,
    Collapse,
    Divider,
    HTMLTable,
    Intent,
    Tag,
} from "@blueprintjs/core";
import { faAngleDown, faAngleRight } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { SEARCH_FORMAT_TAGS } from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { faIcon } from "../../icon";
import { actionToaster, createToast } from "../../toaster";
export const SearchPopoverContent = ({ isTyping, queryString }) => {
    const { annotationState } = useContext(AnnotationContext);
    const [isSearchTipsExpanded, setIsSearchTipsExpanded] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    useEffect(() => {
        if (!_.isEmpty(queryString) && !_.isNil(annotationState.miniSearch)) {
            try {
                const result =
                    annotationState.miniSearch.autoSuggest(queryString);
                var newTerms = [];
                for (let i = 0; i < result.length; i++)
                    newTerms = newTerms.concat(result[i].terms);
                setSuggestions(
                    [...new Set(newTerms)].sort((a, b) => a.localeCompare(b))
                );
            } catch (error) {
                setSuggestions([]);
                actionToaster.show(
                    createToast({
                        intent: Intent.DANGER,
                        message: error.name + ": " + error.message,
                    })
                );
            }
        } else setSuggestions([]);
    }, [queryString]);
    return (
        <div style={{ width: "100%", padding: 5 }}>
            {annotationState.filter.highlightWords.length > 0 ? (
                <div
                    style={{ margin: "5px 11px 10px 11px" }}
                    className={isTyping ? Classes.SKELETON : null}
                >
                    <Tag minimal style={{ marginRight: 5 }}>
                        Matching on
                    </Tag>
                    &quot;{annotationState.filter.highlightWords.join('", "')}
                    &quot;
                </div>
            ) : null}
            {annotationState.filter.highlightWords.length > 0 ? (
                <Divider style={{ marginLeft: 0, marginRight: 0 }} />
            ) : null}
            {_.isEmpty(suggestions) ? null : (
                <Button
                    style={{ pointerEvents: "none", marginBottom: 6 }}
                    alignText="left"
                    fill
                    minimal
                    text={<strong> Suggestions</strong>}
                />
            )}
            {_.isEmpty(suggestions) ? null : (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        padding: "0px 11px 11px 11px",
                    }}
                >
                    {suggestions.map((suggestion) => (
                        <Tag
                            key={`search-popover-content-${suggestion}`}
                            large
                            minimal
                            style={{ marginRight: 7, marginBottom: 4 }}
                        >
                            {suggestion}
                        </Tag>
                    ))}
                </div>
            )}
            <Button
                alignText="left"
                fill
                rightIcon={faIcon({
                    icon: isSearchTipsExpanded ? faAngleDown : faAngleRight,
                })}
                minimal
                onClick={() => setIsSearchTipsExpanded(!isSearchTipsExpanded)}
                text={<strong>Filter mode tips</strong>}
            />
            <Collapse isOpen={isSearchTipsExpanded}>
                <HTMLTable>
                    <thead>
                        <tr>
                            <td>Mode</td>
                            <td>Tip</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{SEARCH_FORMAT_TAGS.fuzzy}</td>
                            <td style={{ lineHeight: "18px" }}>
                                Find terms with minimal character correction
                                (default)
                            </td>
                        </tr>
                        <tr>
                            <td>{SEARCH_FORMAT_TAGS.exact}</td>
                            <td style={{ lineHeight: "18px" }}>
                                Match terms in <Code>&quot;quotes&quot;</Code>{" "}
                                exactly, while combining multiple terms with an
                                AND condition
                            </td>
                        </tr>
                        <tr>
                            <td>{SEARCH_FORMAT_TAGS.regex}</td>
                            <td style={{ lineHeight: "18px" }}>
                                Apply <Code>/pattern/modifier</Code> syntax for
                                regex search
                            </td>
                        </tr>
                    </tbody>
                </HTMLTable>
            </Collapse>
        </div>
    );
};
