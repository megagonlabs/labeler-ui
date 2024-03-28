import { Button, Popover } from "@blueprintjs/core";
import { faCaretDown } from "@fortawesome/pro-duotone-svg-icons";
import { useState } from "react";
import { faIcon } from "../../icon";
export const DoubleClickPopover = ({
    target,
    content,
    shouldShowPopoverButton = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            onDoubleClick={() => setIsOpen(true)}
            style={{ position: "relative" }}
        >
            {target}
            <div
                style={{
                    marginTop: -1,
                    position: "absolute",
                    right: 0,
                    display: shouldShowPopoverButton ? null : "none",
                    top: 0,
                }}
            >
                <Popover
                    autoFocus
                    minimal
                    placement="bottom-end"
                    content={
                        <div onClickCapture={() => setIsOpen(false)}>
                            {content}
                        </div>
                    }
                    isOpen={isOpen && shouldShowPopoverButton}
                    hasBackdrop
                    backdropProps={{
                        onClick: () => setIsOpen(false),
                        onDoubleClick: (event) => event.stopPropagation(),
                        onWheelCapture: (event) => event.stopPropagation(),
                    }}
                >
                    <Button
                        style={{
                            display: shouldShowPopoverButton ? null : "none",
                        }}
                        minimal
                        small
                        active={isOpen}
                        icon={faIcon({
                            icon: faCaretDown,
                            style: { opacity: 0.75 },
                        })}
                        onClick={() => setIsOpen(true)}
                    />
                </Popover>
            </div>
        </div>
    );
};
