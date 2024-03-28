import { Callout, Classes } from "@blueprintjs/core";
import { faChartScatter } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { VegaLite } from "react-vega";
import { notebook_call, python_error_toast } from "../../../constant";
import { DashboardContext } from "../../../context/DashboardContext";
import { DEFAULT_LEGEND_COLOR_PALETTE } from "../../../vega/constant";
import * as jsonSpec from "../../../vega/scatter-plot.json";
import { ContentCard } from "../../ContentCard";
import { LabelClassSelect } from "../../LabelClassSelect";
export const ClassLabel = () => {
    const { dashboardState } = useContext(DashboardContext);
    const [spec, setSpec] = useState(jsonSpec);
    const focusLabel = _.get(dashboardState, "focusLabel", "");
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        var tempSpec = { ...spec };
        _.set(tempSpec, "scales.2.range", DEFAULT_LEGEND_COLOR_PALETTE);
        setSpec(tempSpec);
    }, []);
    useEffect(() => {
        const embedType = _.get(dashboardState, "projection.embed_type", null);
        if (_.isEmpty(embedType) || _.isEmpty(focusLabel)) return;
        setIsLoading(true);
        const get_embeddings_command = `LabelerService.${_.get(
            dashboardState,
            "ipy_interface.service"
        )}.get_statistics().get_embeddings(label_name='${focusLabel}', embed_type='${embedType}')`;
        notebook_call(
            get_embeddings_command,
            _.get(dashboardState, "ipy_interface.kernel_id")
        )
            .then((result) => {
                const embedding_result = JSON.parse(result);
                var tempSpec = { ...spec };
                _.set(tempSpec, "data", [
                    {
                        name: "source",
                        values: embedding_result.map((point) => ({
                            x: point.x_axis,
                            y: point.y_axis,
                            label: point.agg_label,
                        })),
                    },
                ]);
                setSpec(tempSpec);
                setIsLoading(false);
            })
            .catch((error) => {
                python_error_toast({
                    code: get_embeddings_command,
                    message: "Unable to get embeddings data.",
                    error: error,
                });
            });
    }, [focusLabel]);
    return (
        <ContentCard
            title="Class label (in 2D embedding space)"
            icon={faChartScatter}
        >
            <Callout style={{ marginBottom: 10 }}>
                Label class visulization for <LabelClassSelect /> subtask in 2D
                embedding space. Coordinates correspond to the 2D projection of
                &#123;BERT&#125; embedding for raw document text.
                <br />
                Labels are aggregated over annotators using
                &#123;majority_vote&#125; &#40;If a tie happens in voting,
                &quot;tied_annotations&quot; is shown as aggregated class
                label&#41;.
            </Callout>
            {isLoading ? (
                <div className={`${Classes.SKELETON} full-parent-width`}>
                    &nbsp;
                </div>
            ) : (
                <VegaLite spec={spec} />
            )}
        </ContentCard>
    );
};
