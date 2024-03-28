import { Button, ButtonGroup, Classes } from "@blueprintjs/core";
import {
    faHighlighter,
    faTableLayout,
} from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect } from "react";
import { useHotkeysContext } from "react-hotkeys-hook";
import { AnnotationContext } from "../context/AnnotationContext";
import { faIcon } from "../icon";
export const ViewSelector = ({ view, setView, isInitFinished }) => {
    const { enableScope, disableScope, enabledScopes } = useHotkeysContext();
    const { annotationState } = useContext(AnnotationContext);
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    const tableView = () => {
        enableScope("table");
        disableScope("single");
        setView("table");
    };
    const singleView = () => {
        enableScope("single");
        disableScope("table");
        setView("single");
    };
    useEffect(() => {
        if (["verifying", "reconciling"].includes(widgetMode)) {
            tableView();
        }
    }, [widgetMode]);
    return (
        <ButtonGroup
            minimal
            className={!isInitFinished ? Classes.SKELETON : null}
        >
            <Button
                icon={faIcon({ icon: faHighlighter })}
                text="Single"
                active={_.isEqual(view, "single")}
                disabled={["verifying", "reconciling"].includes(widgetMode)}
                onClick={singleView}
            />
            <Button
                icon={faIcon({ icon: faTableLayout })}
                text="Table"
                active={_.isEqual(view, "table")}
                onClick={tableView}
            />
        </ButtonGroup>
    );
};
