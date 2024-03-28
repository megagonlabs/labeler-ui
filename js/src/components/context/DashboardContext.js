import _ from "lodash";
import { createContext, useReducer } from "react";
const DashboardContext = createContext();
const reducer = (state, action) => {
    const { payload, type } = action;
    switch (type) {
        case "SET_STATE_BY_KEY": {
            const { key, value } = payload;
            return { ...state, [key]: value };
        }
        case "UPDATE_UID_MAPPING": {
            return {
                ...state,
                uidMap: _.merge(state.uidMap, payload),
            };
        }
        default:
            return { ...state };
    }
};
const initialState = {};
const DashboardProvider = (props) => {
    const [dashboardState, dispatch] = useReducer(reducer, initialState);
    const action = {
        setStateByKey: (keyValue) =>
            dispatch({ type: "SET_STATE_BY_KEY", payload: keyValue }),
        updateUidMapping: (payload) =>
            dispatch({ type: "UPDATE_UID_MAPPING", payload: payload }),
    };
    return (
        <DashboardContext.Provider
            value={{ dashboardState: dashboardState, dashboardAction: action }}
        >
            {props.children}
        </DashboardContext.Provider>
    );
};
export { DashboardContext, DashboardProvider };
