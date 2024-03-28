import { Code } from "@blueprintjs/core";
export const ReconcilingDoc = () => {
    return (
        <div>
            <p>
                The reconciliation widget collects annotations across multiple
                annotators and allows users to “reconcile” any conflicts by
                assigning a final annotation. In the current version,
                reconciliation is only supported for record-level labels in the
                table view.
            </p>
            <p>
                Any existing annotations will be presented in the annotation
                summary column as distribution bar for all the candidate labels.
                In the dropdown, there is detailed information of each annotator
                or labeling agent.
            </p>
            <p>
                To assign a final annotation, similar to the annotation widget,
                select in the bolded label column and save. This annotation will
                be saved in the backend with{" "}
                <Code>annotator=&apos;reconcilor&apos;</Code>.
            </p>
        </div>
    );
};
