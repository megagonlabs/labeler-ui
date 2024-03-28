// https://nmingaleev.medium.com/draggable-and-resizable-panel-with-react-hooks-part-2-6e6d0076bcf1
import { Icon } from "@blueprintjs/core";
import { faCaretRight } from "@fortawesome/pro-duotone-svg-icons";
import React, { useEffect, useState } from "react";
import { faIcon } from "../icon";
import { Direction } from "./constant";
const Resizer = ({ onResize }) => {
    const [direction, setDirection] = useState("");
    const [mouseDown, setMouseDown] = useState(false);
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!direction) return;
            onResize(direction, e.movementX, e.movementY);
        };
        if (mouseDown) window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseDown, direction, onResize]);
    useEffect(() => {
        const handleMouseUp = () => setMouseDown(false);
        window.addEventListener("mouseup", handleMouseUp);
        return () => window.removeEventListener("mouseup", handleMouseUp);
    }, []);
    const handleMouseDown = (direction) => () => {
        setDirection(direction);
        setMouseDown(true);
    };
    return (
        <div
            onMouseDown={handleMouseDown(Direction.BottomRight)}
            style={{
                position: "absolute",
                cursor: "nwse-resize",
                right: 0,
                bottom: 0,
                paddingRight: 1,
            }}
        >
            <Icon
                icon={faIcon({
                    icon: faCaretRight,
                    className: "fa-rotate-by",
                    style: { "--fa-rotate-angle": "45deg" },
                })}
            />
        </div>
    );
};
export default Resizer;
