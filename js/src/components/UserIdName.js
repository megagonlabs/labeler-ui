import _ from "lodash";
import { useContext } from "react";
import { DashboardContext } from "./context/DashboardContext";
export const UserIdName = ({ uid }) => {
    const { dashboardState } = useContext(DashboardContext);
    return _.get(dashboardState, ["uidMap", uid], uid);
};
