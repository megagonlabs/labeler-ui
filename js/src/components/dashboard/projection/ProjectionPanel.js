import {
    Button,
    Menu,
    MenuItem,
    Popover,
    PopoverInteractionKind,
} from "@blueprintjs/core";
import { faChartScatter, faListTree } from "@fortawesome/pro-duotone-svg-icons";
import { useRef } from "react";
import { faIcon } from "../../icon";
import { ClassLabel } from "./2d-projection/ClassLabel";
export const ProjectionPanel = () => {
    const classLabelRef = useRef(null);
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
                                            classLabelRef.current.offsetTop -
                                            parentRef.current.offsetTop -
                                            20,
                                        behavior: "smooth",
                                    })
                                }
                                icon={faIcon({ icon: faChartScatter })}
                                text="Class Label"
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
                <div ref={classLabelRef}>
                    <ClassLabel />
                </div>
            </div>
        </div>
    );
};
