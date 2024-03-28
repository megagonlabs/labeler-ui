import { Callout } from "@blueprintjs/core";
import { Cell, Column, Table2 } from "@blueprintjs/table";
import { HeaderCell } from "@blueprintjs/table/lib/esm/headers/headerCell";
import { faGrid } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import { UserIdName } from "../../UserIdName";
import { notebook_call, python_error_toast } from "../../constant";
import { DashboardContext } from "../../context/DashboardContext";
import { ContentCard } from "../ContentCard";
import { LabelClassSelect } from "../LabelClassSelect";
export const Agreement = () => {
    const { dashboardState } = useContext(DashboardContext);
    const [data, setData] = useState({});
    const [users, setUsers] = useState([]);
    const focusLabel = _.get(dashboardState, "focusLabel", "");
    useEffect(() => {
        if (_.isNil(focusLabel) || _.isEmpty(focusLabel)) return;
        const get_annotator_agreements_command = `LabelerService.${_.get(
            dashboardState,
            "ipy_interface.service"
        )}.get_statistics().get_annotator_agreements(label_name='${focusLabel}')`;
        notebook_call(
            get_annotator_agreements_command,
            _.get(dashboardState, "ipy_interface.kernel_id")
        )
            .then((result) => {
                var agreementMatrix = {};
                const agreements = JSON.parse(result);
                const keys = Object.keys(agreements);
                var uniqueUsers = new Set();
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const annotators = key.split(",");
                    uniqueUsers.add(annotators[0]);
                    uniqueUsers.add(annotators[1]);
                    _.set(
                        agreementMatrix,
                        [annotators[0], annotators[1]],
                        agreements[key]
                    );
                }
                setUsers(Array.from(uniqueUsers));
                setData(agreementMatrix);
            })
            .catch((error) => {
                python_error_toast({
                    code: get_annotator_agreements_command,
                    message: "Unable to get annotator agreements data.",
                    error: error,
                });
            });
    }, [focusLabel]);
    return (
        <ContentCard title="Agreements" icon={faGrid}>
            <Callout style={{ marginBottom: 10 }}>
                Pairwise agreement score &#40;cohen_kappa&#41; on{" "}
                <LabelClassSelect /> subtask among all annotators. <br />
                Empty entries are not excluded and treated as same.
            </Callout>
            <div
                className="full-parent-width"
                style={{ marginTop: 10, height: 200 }}
            >
                <Table2
                    key={"annotator-agreement-table"}
                    numFrozenColumns={1}
                    numRows={users.length}
                    enableRowResizing={false}
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
                                    {rowIndex}
                                </div>
                            </HeaderCell>
                        );
                    }}
                >
                    <Column
                        name=""
                        cellRenderer={(rowIndex) => (
                            <Cell>
                                <UserIdName uid={users[rowIndex]} />
                            </Cell>
                        )}
                    />
                    {users.map((user, index) => {
                        return (
                            <Column
                                key={`annotator-aggrement-column-${index}`}
                                name={<UserIdName uid={user} />}
                                cellRenderer={(rowIndex, columnIndex) => {
                                    const rowUser = users[rowIndex],
                                        colUser = users[columnIndex - 1];
                                    if (_.isEqual(rowUser, colUser))
                                        return <Cell></Cell>;
                                    const score = _.get(
                                        data,
                                        [rowUser, colUser],
                                        null
                                    );
                                    return (
                                        <Cell>
                                            {_.isNumber(score) ? score : null}
                                        </Cell>
                                    );
                                }}
                            />
                        );
                    })}
                </Table2>
            </div>
        </ContentCard>
    );
};
