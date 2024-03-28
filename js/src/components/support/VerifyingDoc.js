import { Callout, Code, Intent } from "@blueprintjs/core";
import { faArrowRightLong } from "@fortawesome/pro-duotone-svg-icons";
import { faIcon } from "../icon";
export const VerifyingDoc = () => {
    return (
        <div>
            <p>
                The verification widget presents the annotation by an automated
                agent (e.g., LLM) for human verification. In the current
                version, verification is only supported for record-level labels
                in the table view.
            </p>
            <p>
                Labels extracted from the agent’s response are shown in the
                &quot;(Label)&quot; column. To verify, select from the dropdown
                and save. If the label has metadata like confidence score,
                provide it in the <Code>.show()</Code> function (e.g.,{" "}
                <Code>&quot;label_meta_names&quot;: [&quot;conf&quot;]</Code>)
                to include it in the table.
                <Callout
                    style={{ marginTop: 10 }}
                    intent={Intent.PRIMARY}
                    icon={null}
                    title="Optional parameter "
                >
                    <Code>label_meta_names</Code>: when a valid label_meta_name
                    is provided in the <Code>.show&#40;&#41;</Code> function
                    &#40;e.g.,{" "}
                    <Code>
                        .show&#40;&#123;&quot;mode&quot;:&quot;verifying&quot;,
                        &quot;label_meta_names&quot;:
                        &#91;&quot;conf&quot;&#93;&#125;&#41;
                    </Code>
                    , corresponding metadata will show in an additional column.
                </Callout>
            </p>
            <p>
                To batch confirm the agent’s labels, select multiple columns and
                click “Bulk edit” {faIcon({ icon: faArrowRightLong })} “Confirm
                remainder”. Any empty labels will be populated with the original
                output of the automated agent.
            </p>
        </div>
    );
};
