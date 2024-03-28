import {
    Button,
    Menu,
    MenuDivider,
    MenuItem,
    Popover,
    PopoverInteractionKind,
} from "@blueprintjs/core";
import {
    faChartPie,
    faListTree,
    faPercent,
} from "@fortawesome/pro-duotone-svg-icons";
import { useRef } from "react";
import { faIcon } from "../../icon";
import { Progress } from "./Progress";
import { Distribution } from "./label/Distribution";
export const OverviewPanel = () => {
    const progressRef = useRef(null);
    const distributionRef = useRef(null);
    const parentRef = useRef(null);
    return (
        <div
            className="overscroll-behavior-contain"
            style={{
                marginTop: 1,
                overflowY: "scroll",
                height: "100%",
            }}
            ref={parentRef}
        >
            <div
                style={{
                    margin: "19px 10px 20px 20px",
                    position: "absolute",
                    height: 40,
                    width: 40,
                }}
            >
                <Popover
                    enforceFocus={false}
                    interactionKind={PopoverInteractionKind.HOVER}
                    position="bottom-left"
                    minimal
                    content={
                        <Menu>
                            <MenuItem
                                onClick={() =>
                                    parentRef.current.scrollTo({
                                        top:
                                            progressRef.current.offsetTop -
                                            parentRef.current.offsetTop -
                                            20,
                                        behavior: "smooth",
                                    })
                                }
                                icon={faIcon({ icon: faPercent })}
                                text="Overall Progress"
                            />
                            <MenuDivider title="Class Label" />
                            <MenuItem
                                onClick={() =>
                                    parentRef.current.scrollTo({
                                        top:
                                            distributionRef.current.offsetTop -
                                            parentRef.current.offsetTop -
                                            20,
                                        behavior: "smooth",
                                    })
                                }
                                icon={faIcon({ icon: faChartPie })}
                                text="Distributions"
                            />
                        </Menu>
                    }
                >
                    <Button
                        style={{ padding: 0 }}
                        large
                        minimal
                        icon={faIcon({ icon: faListTree })}
                    />
                </Popover>
            </div>
            <div
                style={{
                    width: "calc(100% - 70px)",
                    padding: "20px 20px 20px 1px",
                    marginLeft: 70,
                }}
            >
                <div ref={progressRef}>
                    <Progress />
                </div>
                <div ref={distributionRef} style={{ marginTop: 10 }}>
                    <Distribution />
                </div>
            </div>
        </div>
    );
};
