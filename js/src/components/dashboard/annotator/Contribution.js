import { Cell, Column, Table2 } from "@blueprintjs/table";
import { HeaderCell } from "@blueprintjs/table/lib/esm/headers/headerCell";
import { faBarsProgress } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { UserIdName } from "../../UserIdName";
import { notebook_call, python_error_toast } from "../../constant";
import { DashboardContext } from "../../context/DashboardContext";
import { ContentCard } from "../ContentCard";
export const Contribution = () => {
    const { dashboardState, dashboardAction } = useContext(DashboardContext);
    const [data, setData] = useState([]);
    useEffect(() => {
        const get_annotator_contributions_command = `LabelerService.${_.get(
            dashboardState,
            "ipy_interface.service"
        )}.get_statistics().get_annotator_contributions()`;
        notebook_call(
            get_annotator_contributions_command,
            _.get(dashboardState, "ipy_interface.kernel_id")
        )
            .then((result) => {
                const contributions = JSON.parse(result);
                var tempData = [],
                    contributionKeys = Object.keys(contributions);
                const get_user_names_command = `LabelerService.${_.get(
                    dashboardState,
                    "ipy_interface.service"
                )}.get_users_by_uids(uids=${JSON.stringify(contributionKeys)})`;
                notebook_call(
                    get_user_names_command,
                    _.get(dashboardState, "ipy_interface.kernel_id")
                ).then((result) => {
                    dashboardAction.updateUidMapping(JSON.parse(result));
                });
                for (let i = 0; i < contributionKeys.length; i++) {
                    const key = contributionKeys[i];
                    tempData.push({
                        uid: key,
                        total: contributions[key],
                    });
                }
                setData(tempData);
            })
            .catch((error) => {
                python_error_toast({
                    code: get_annotator_contributions_command,
                    message: "Unable to get annotator contributions data.",
                    error: error,
                });
            });
    }, []);
    return (
        <ContentCard title="Contributions" icon={faBarsProgress}>
            <div className="full-parent-width" style={{ height: 200 }}>
                <Table2
                    key={"annotator-contribution-table"}
                    rowHeaderCellRenderer={(rowIndex) => {
                        return (
                            <HeaderCell>
                                <div
                                    className="bp5-table-row-name"
                                    style={{
                                        textAlign: "center",
                                        minWidth: 40,
                                    }}
                                >
                                    {rowIndex + 1}
                                </div>
                            </HeaderCell>
                        );
                    }}
                    numRows={data.length}
                    enableRowResizing={false}
                >
                    <Column
                        name="Annotator / Agent"
                        cellRenderer={(rowIndex) => {
                            return (
                                <Cell>
                                    <UserIdName uid={data[rowIndex].uid} />
                                </Cell>
                            );
                        }}
                    />
                    <Column
                        name="Total"
                        cellRenderer={(rowIndex) => {
                            return <Cell>{data[rowIndex].total}</Cell>;
                        }}
                    />
                </Table2>
            </div>
        </ContentCard>
    );
};
