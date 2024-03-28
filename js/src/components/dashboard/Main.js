import { Button, ButtonGroup, Card } from "@blueprintjs/core";
import _ from "lodash";
import { useContext } from "react";
import { LoadingScreen } from "../annotation/LoadingScreen";
import { DashboardContext } from "../context/DashboardContext";
import { AnnotatorPanel } from "./annotator/AnnotatorPanel";
import { OverviewPanel } from "./overview/OverviewPanel";
import { ProjectionPanel } from "./projection/ProjectionPanel";
export const Main = ({
    isInitFinished,
    setTabId,
    tabId,
    initStages,
    title,
}) => {
    const { dashboardState } = useContext(DashboardContext);
    const TAB_VIEWS = {
        annotator: <AnnotatorPanel />,
        overview: <OverviewPanel />,
        projection: <ProjectionPanel />,
    };
    if (isInitFinished) {
        return (
            <>
                <Card
                    style={{
                        padding: "5px 20px",
                        borderRadius: 0,
                        display: "flex",
                    }}
                >
                    {title}
                    <ButtonGroup minimal>
                        <Button
                            active={_.isEqual(tabId, "overview")}
                            text="Overview"
                            onClick={() => setTabId("overview")}
                        />
                        <Button
                            active={_.isEqual(tabId, "annotator")}
                            text="Annotator"
                            onClick={() => setTabId("annotator")}
                        />
                        <Button
                            active={_.isEqual(tabId, "projection")}
                            text="Projection"
                            disabled={_.isEmpty(
                                _.get(
                                    dashboardState,
                                    "projection.embed_type",
                                    null
                                )
                            )}
                            onClick={() => setTabId("projection")}
                        />
                    </ButtonGroup>
                </Card>
                {_.isNil(
                    _.get(dashboardState, "ipy_interface.service")
                ) ? null : (
                    <div
                        key={`dashboard-tab-view-${tabId}`}
                        style={{ height: "calc(100% - 40px)" }}
                    >
                        {_.get(TAB_VIEWS, tabId, null)}
                    </div>
                )}
            </>
        );
    }
    return (
        <LoadingScreen
            title="Initializing dashboard widget..."
            initStages={initStages}
        />
    );
};
