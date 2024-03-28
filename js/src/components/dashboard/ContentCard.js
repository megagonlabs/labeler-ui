import { Card, Tag } from "@blueprintjs/core";
import { faIcon } from "../icon";
export const ContentCard = ({ children, title, icon }) => {
    return (
        <Card style={{ padding: 10 }}>
            <Tag
                icon={faIcon({ icon: icon })}
                fill
                large
                intent="primary"
                minimal
                style={{ marginBottom: 10 }}
            >
                {title}
            </Tag>
            <div style={{ overflow: "hidden", padding: 1 }}>{children}</div>
        </Card>
    );
};
