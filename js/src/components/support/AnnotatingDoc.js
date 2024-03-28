import {
    Button,
    ButtonGroup,
    Callout,
    Code,
    H5,
    Intent,
} from "@blueprintjs/core";
import {
    faCircleExclamation,
    faColumns,
    faFilterList,
    faSlidersH,
} from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useState } from "react";
import { SUBMISSION_STATE_ICON } from "../constant";
import { faIcon } from "../icon";
export const AnnotatingDoc = () => {
    const success_icon = faIcon({
            icon: _.get(SUBMISSION_STATE_ICON, "success.icon", null),
            style: _.get(SUBMISSION_STATE_ICON, "success.style", {}),
        }),
        error_icon = faIcon({
            icon: _.get(SUBMISSION_STATE_ICON, "error.icon", null),
            style: _.get(SUBMISSION_STATE_ICON, "error.style", {}),
        }),
        table_column_icon = faIcon({
            icon: faColumns,
            style: { color: "#5f6b7c" },
        }),
        column_filter_icon = faIcon({
            icon: faFilterList,
            style: { color: "#5f6b7c" },
        }),
        setting_icon = faIcon({
            icon: faSlidersH,
            style: { color: "#5f6b7c" },
        });
    const [tab, setTab] = useState("basic");
    return (
        <div>
            <ButtonGroup minimal>
                <Button
                    text="Basic"
                    active={_.isEqual(tab, "basic")}
                    onClick={() => {
                        setTab("basic");
                    }}
                />
                <Button
                    text="Advanced"
                    active={_.isEqual(tab, "advanced")}
                    onClick={() => {
                        setTab("advanced");
                    }}
                />
            </ButtonGroup>
            {_.isEqual(tab, "basic") ? (
                <>
                    <H5>Basic Usage</H5>
                    <p>
                        The annotation widget consists of an exploratory table
                        view and a zoomed-in single view. In either view, the
                        save button will persist any annotations collected in
                        the widget to the backend.
                    </p>
                    <Callout
                        title="Important"
                        intent={Intent.WARNING}
                        icon={faIcon({ icon: faCircleExclamation })}
                    >
                        Unsaved changes will be lost once the widget is
                        re-initiated or the web page is refreshed
                    </Callout>
                    <H5>Table View</H5>
                    <p>
                        Data records are organized in a table for easier
                        exploration and comparison. Each row corresponds to a
                        record in the subset. Default columns are:
                    </p>
                    <ul>
                        <li>
                            <p>
                                <strong>Submit Status</strong>: An icon will
                                show if a record has unsaved changes. After
                                clicking the save button, a success (
                                {success_icon}) or error ({error_icon}) icon
                                will appear to indicate the submit status.
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>Selector</strong>: Checkbox to select
                                multiple records for bulk labeling.
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>Record Content</strong>: Pre-populated
                                with textual data content.
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>Labels</strong>: Columns with bolded
                                headers show record-level labels loaded from the
                                schema and are pre-populated with any previous
                                annotation from the annotator. To annotate,
                                select from the dropdown in the corresponding
                                row.
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>Record Metadata</strong>: Record-level
                                metadata when specified in the{" "}
                                <Code>.show()</Code> function. Please see the
                                &quot;
                                <a
                                    onClick={() => {
                                        setTab("advanced");
                                        document
                                            .querySelector(
                                                ".support-dialog-docs"
                                            )
                                            .scrollTo({
                                                behavior: "smooth",
                                                top: 0,
                                            });
                                    }}
                                >
                                    Advanced Usage
                                </a>
                                &quot; for examples.
                            </p>
                        </li>
                    </ul>
                    <p>
                        You can drag to reorder columns or use the column
                        visibility button ({table_column_icon}) to hide and show
                        columns. To enter the single view, use the toggle on the
                        upper right corner or double click on a specific data
                        record cell.
                    </p>
                    <H5>Single View</H5>
                    <p>
                        The single view of the annotation widget displays one
                        data record at a time. In the current version,
                        span-level tasks are only supported in the single view.
                    </p>
                    <p>
                        You can drag to highlight and assign any span-level
                        labels on the left panel and select record-level labels
                        on the right side. Changes will be automatically
                        reflected in the table view.
                    </p>
                </>
            ) : (
                <>
                    <H5>Advanced Usage</H5>
                    <H5>Sorting and Filtering Records</H5>
                    <p>
                        There are several ways to sort and filter the records in
                        the widget for a more directed annotating experience.
                    </p>
                    <ul>
                        <li>
                            <p>
                                <strong>Content Filter</strong>: Use the search
                                box at the top to filter over the record content
                                by any keyword (precise or fuzzy matching).
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>Column Filters</strong>: For other
                                columns, click on the dropdown in the column
                                header to sort or filter the table by the column
                                value. The clear filter button (
                                {column_filter_icon}) clears any existing column
                                filter.
                            </p>
                        </li>
                    </ul>
                    <H5>
                        <Code>.show()</Code> Function Configuration
                    </H5>
                    <p>
                        The widget provides several configuration options at
                        initialization time through the <Code>.show()</Code>{" "}
                        function.
                    </p>
                    <ul>
                        <li>
                            <p>
                                <strong>view</strong>: &quot;single&quot; |
                                &quot;table&quot;, default &quot;single&quot;
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>mode</strong>: &quot;annotating&quot; |
                                &quot;reconciling&quot; | &quot;verifying&quot;,
                                default &quot;annotating&quot;
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>title</strong>: default
                                &quot;Annotation&quot; |
                                &quot;Reconciliation&quot; |
                                &quot;Verification&quot;
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>height</strong>: default 300 (pixels)
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>record_meta_names</strong>: list of
                                record metadata names for to show in the widget.
                                <Callout
                                    title="Example"
                                    style={{ marginTop: 10 }}
                                    intent={Intent.PRIMARY}
                                    icon={null}
                                >
                                    If record metadata length exists,{" "}
                                    <Code>
                                        .show&#40;&#123;record_meta_names:&#91;&apos;length&apos;&#93;&#41;
                                    </Code>{" "}
                                    will show the length of each record in a
                                    additional column.
                                </Callout>
                            </p>
                        </li>
                    </ul>
                    <H5>Widget Settings</H5>
                    <p>
                        In either table or single view, click on the settings
                        button ({setting_icon}) to further customize the widget.
                    </p>
                    <ul>
                        <li>
                            <p>
                                <strong>Color Assist</strong>: changes the label
                                colors to a color-blind-friendly palette.
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>Hide Span Label Value</strong>: controls
                                the visibility of span-level labels in case you
                                need more space.
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>Smart (Word) Text Selection</strong>:
                                controls the granularity of span selections,
                                being word or character.
                            </p>
                        </li>
                    </ul>
                </>
            )}
        </div>
    );
};
