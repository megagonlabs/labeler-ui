import { Callout, Classes } from "@blueprintjs/core";
import { faChartPie } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { VegaLite } from "react-vega";
import { notebook_call, python_error_toast } from "../../../constant";
import { DashboardContext } from "../../../context/DashboardContext";
import { DEFAULT_LEGEND_COLOR_PALETTE } from "../../../vega/constant";
import * as jsonSpec from "../../../vega/pie-plot.json";
import { ContentCard } from "../../ContentCard";
import { LabelClassSelect } from "../../LabelClassSelect";
export const Distribution = () => {
    const { dashboardState } = useContext(DashboardContext);
    const [spec, setSpec] = useState(jsonSpec);
    const focusLabel = _.get(dashboardState, "focusLabel", "");
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        var tempSpec = { ...spec };
        _.set(tempSpec, "encoding.color.scheme", DEFAULT_LEGEND_COLOR_PALETTE);
        setSpec(tempSpec);
    }, []);
    useEffect(() => {
        if (_.isNil(focusLabel) || _.isEmpty(focusLabel)) return;
        setIsLoading(true);
        const get_label_distributions_command = `LabelerService.${_.get(
            dashboardState,
            "ipy_interface.service"
        )}.get_statistics().get_label_distributions(label_name='${focusLabel}')`;
        notebook_call(
            get_label_distributions_command,
            _.get(dashboardState, "ipy_interface.kernel_id")
        )
            .then((result) => {
                var tempSpec = { ...spec };
                const distribution = JSON.parse(result);
                _.set(tempSpec, "data", {
                    values: Object.keys(distribution).map((key) => ({
                        label: key,
                        total: distribution[key],
                    })),
                });
                setSpec(tempSpec);
                setIsLoading(false);
            })
            .catch((error) => {
                python_error_toast({
                    code: get_label_distributions_command,
                    message: "Unable to get label distributions data.",
                    error: error,
                });
            });
    }, [focusLabel]);
    return (
        <ContentCard title="Class Label - Distributions" icon={faChartPie}>
            <Callout style={{ marginBottom: 10 }}>
                Label class distribution for <LabelClassSelect /> subtask:
                aggregated over annotators&apos; votes using
                &#123;majority_vote&#125;. <br />
                When there is a tie in the voting, they are categorized under
                &quot;tied_annotations&quot; class label.
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
