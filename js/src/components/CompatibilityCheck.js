import { Divider, Popover, Tag } from "@blueprintjs/core";
import { satisfies } from "compare-versions";
import _ from "lodash";
import { useEffect, useState } from "react";
import {
    browserName,
    fullBrowserVersion,
    isChrome,
    isSafari,
} from "react-device-detect";
export const CompatibilityCheck = () => {
    const [checks, setChecks] = useState([]);
    useEffect(() => {
        const REQUIREMENTS = {
            "Regular expression": {
                chrome: ">=62",
                safari: ">=16.4",
            },
        };
        const keys = Object.keys(REQUIREMENTS);
        var browserKey = "",
            tempChecks = [];
        if (isChrome) browserKey = "chrome";
        else if (isSafari) browserKey = "safari";
        for (let i = 0; i < keys.length; i++) {
            const condition = _.get(REQUIREMENTS, [keys[i], browserKey], null);
            if (
                !_.isNil(condition) &&
                !satisfies(fullBrowserVersion, condition)
            )
                tempChecks.push({
                    text: keys[i],
                    condition: condition,
                });
        }
        setChecks(tempChecks);
    }, [browserName, fullBrowserVersion, isChrome, isSafari]);
    if (_.isEmpty(checks)) return null;
    return (
        <div>
            <Popover
                position="top-right"
                minimal
                interactionKind="hover-target"
                content={
                    <div style={{ padding: 5 }}>
                        <strong style={{ marginLeft: 2 }}>{browserName}</strong>{" "}
                        (Version {fullBrowserVersion})
                        <Divider />
                        <table>
                            <tbody>
                                {checks.map((check, index) => (
                                    <tr
                                        key={`app-compatibility-checks-${index}`}
                                    >
                                        <td>
                                            <span
                                                style={{
                                                    marginRight: 5,
                                                }}
                                            >
                                                {check.text}
                                            </span>
                                        </td>
                                        <td
                                            style={{
                                                paddingTop:
                                                    index > 0 ? 1.25 : 0,
                                                paddingBottom: _.isEqual(
                                                    index,
                                                    checks.length - 1
                                                )
                                                    ? 0
                                                    : 1.25,
                                            }}
                                        >
                                            <Tag minimal intent="danger">
                                                {check.condition}
                                            </Tag>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }
            >
                <Tag minimal intent="warning">
                    Compatibility issue{checks.length > 1 ? "s" : ""}
                </Tag>
            </Popover>
        </div>
    );
};
