import { HTMLSelect } from "@blueprintjs/core";
import _ from "lodash";
import { useContext } from "react";
import { DashboardContext } from "../context/DashboardContext";
export const LabelClassSelect = () => {
    const { dashboardState, dashboardAction } = useContext(DashboardContext);
    const focusLabel = _.get(dashboardState, "focusLabel", "");
    const schemas = _.get(dashboardState, "schemas", []);
    const setFocusLabel = (label) =>
        dashboardAction.setStateByKey({
            key: "focusLabel",
            value: label,
        });
    return (
        <HTMLSelect
            value={focusLabel}
            onChange={(event) => setFocusLabel(event.currentTarget.value)}
        >
            {schemas.map((label, index) => {
                if (!_.isEqual(label.level, "record")) return;
                return (
                    <option
                        value={label.name}
                        key={`focus-label-select-${index}`}
                    >
                        {label.name}
                    </option>
                );
            })}
        </HTMLSelect>
    );
};
