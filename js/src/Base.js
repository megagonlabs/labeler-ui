import { Card, FocusStyleManager } from "@blueprintjs/core";
import bpCss from "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import bpTableCss from "../node_modules/@blueprintjs/table/lib/css/table.css";
import normalizeCss from "../node_modules/normalize.css/normalize.css";
import customCss from "../styles/custom.css";
import utilityCss from "../styles/utility.css";
FocusStyleManager.onlyShowFocusOnTabs();
export const Base = ({ children, border = true }) => {
    return (
        <div className="no-focus-outline" style={{ position: "relative" }}>
            <style>{normalizeCss}</style>
            <style>{bpCss}</style>
            <style>{bpTableCss}</style>
            <style>{customCss}</style>
            <style>{utilityCss}</style>
            {border ? (
                <Card style={{ padding: 0, margin: 1, overflow: "hidden" }}>
                    {children}
                </Card>
            ) : (
                children
            )}
        </div>
    );
};
