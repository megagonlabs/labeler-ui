/* eslint-disable no-unused-vars */
/* eslint-disable react/no-render-return-value */
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Annotation } from "./Annotation";
import { Dashboard } from "./Dashboard";
import { AnnotationProvider } from "./components/context/AnnotationContext";
import { DashboardProvider } from "./components/context/DashboardContext";
import withContext from "./components/context/withContext";
export function bind(node, config) {
    return {
        create: (component, props, children) =>
            React.createElement(component, props, ...children),
        render: (element) => ReactDOM.render(element, node),
        unmount: () => ReactDOM.unmountComponentAtNode(node),
    };
}
const AnnotationWidget = withContext(Annotation, AnnotationProvider);
const DashboardWidget = withContext(Dashboard, DashboardProvider);
export { AnnotationWidget, DashboardWidget };
