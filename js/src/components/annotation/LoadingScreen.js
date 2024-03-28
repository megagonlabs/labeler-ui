import { Button, NonIdealState } from "@blueprintjs/core";
import { faIcon } from "../icon";
import {
    faCheck,
    faCloudArrowDown,
    faEllipsis,
} from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { GREEN_CHECK_COLOR } from "../constant";
export const LoadingScreen = ({ initStages, title }) => {
    return (
        <NonIdealState
            className="full-parent-height"
            icon={faIcon({
                icon: faCloudArrowDown,
                className: "fa-beat-fade",
                size: 30,
            })}
            title={title}
            description={
                <div style={{ width: 190 }}>
                    {initStages.map((stage, index) => {
                        const complete = _.get(stage, "complete", false);
                        return (
                            <Button
                                key={`loading-screen-stage-${index}`}
                                fill
                                alignText="left"
                                className="no-pointer-events"
                                minimal
                                text={stage.text}
                                rightIcon={faIcon({
                                    icon: complete ? faCheck : faEllipsis,
                                    style: {
                                        color: complete
                                            ? GREEN_CHECK_COLOR
                                            : "",
                                    },
                                })}
                            />
                        );
                    })}
                </div>
            }
        />
    );
};
