import { Callout, Classes, Code, ProgressBar } from "@blueprintjs/core";
import { faPercent } from "@fortawesome/pro-duotone-svg-icons";
import classNames from "classnames";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { notebook_call, python_error_toast } from "../../constant";
import { DashboardContext } from "../../context/DashboardContext";
import { ContentCard } from "../ContentCard";
export const Progress = () => {
    const { dashboardState } = useContext(DashboardContext);
    const [data, setData] = useState(null);
    useEffect(() => {
        const get_label_progress_command = `LabelerService.${_.get(
            dashboardState,
            "ipy_interface.service"
        )}.get_statistics().get_label_progress()`;
        notebook_call(
            get_label_progress_command,
            _.get(dashboardState, "ipy_interface.kernel_id")
        )
            .then((result) => {
                setData(JSON.parse(result));
            })
            .catch((error) => {
                python_error_toast({
                    code: get_label_progress_command,
                    message: "Unable to get label progress data.",
                    error: error,
                });
            });
    }, []);
    return (
        <ContentCard title="Overall Progress" icon={faPercent}>
            <div
                className={classNames({
                    "full-parent-width": true,
                    [Classes.SKELETON]: _.isNil(data),
                })}
            >
                <Callout>
                    Annotated{" "}
                    <Code style={{ fontSize: "15px" }}>
                        {_.get(data, "annotated", null)}
                    </Code>{" "}
                    data points &#40;with at least 1 label&#41; out of{" "}
                    <Code style={{ fontSize: "15px" }}>
                        {_.get(data, "total", null)}
                    </Code>{" "}
                    total data points
                </Callout>
                {_.isNil(data) ? null : (
                    <div style={{ marginTop: 5 }}>
                        <ProgressBar
                            animate={false}
                            value={data.annotated / data.total}
                        />
                    </div>
                )}
            </div>
        </ContentCard>
    );
};
