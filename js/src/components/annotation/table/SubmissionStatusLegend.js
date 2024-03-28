import { Classes, Colors, Divider, Popover } from "@blueprintjs/core";
import {
    faCircleSmall,
    faCloudArrowUp,
} from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext } from "react";
import { SUBMISSION_STATE_ICON } from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { faIcon } from "../../icon";
export const SubmissionStatusLegend = () => {
    const { annotationState } = useContext(AnnotationContext);
    const widgetMode = _.get(annotationState, "widgetMode", "annotating");
    const submissionStateKeys = Object.keys(SUBMISSION_STATE_ICON);
    return (
        <Popover
            interactionKind="hover-target"
            placement="bottom-start"
            minimal
            content={
                <div style={{ padding: 10, maxWidth: 200 }}>
                    <div>Submit status</div>
                    <Divider />
                    {submissionStateKeys.map((stateKey) => {
                        if (
                            !_.isEqual(widgetMode, "verifying") &&
                            _.isEqual(stateKey, "verified")
                        )
                            return null;
                        return (
                            <div key={`submission-status-legend-${stateKey}`}>
                                {_.capitalize(stateKey)}:
                                {faIcon({
                                    icon: _.get(
                                        SUBMISSION_STATE_ICON,
                                        [stateKey, "icon"],
                                        null
                                    ),
                                    style: {
                                        ..._.get(
                                            SUBMISSION_STATE_ICON,
                                            [stateKey, "style"],
                                            {}
                                        ),
                                        marginLeft: 5,
                                    },
                                })}
                            </div>
                        );
                    })}
                    <div>
                        Unsaved change:
                        {faIcon({
                            icon: faCircleSmall,
                            style: {
                                color: Colors.BLUE3,
                                opacity: 0.75,
                                marginLeft: 5,
                            },
                        })}
                    </div>
                    <div
                        className={Classes.TEXT_MUTED}
                        style={{ marginTop: 5 }}
                    >
                        Hover over status icons of individual records for more
                        information.
                    </div>
                </div>
            }
        >
            {faIcon({
                size: 20,
                style: { opacity: 0.75 },
                icon: faCloudArrowUp,
            })}
        </Popover>
    );
};
