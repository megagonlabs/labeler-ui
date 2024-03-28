import { Icon } from "@blueprintjs/core";
import { faCaretDown, faCaretUp } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext } from "react";
import { AnnotationContext } from "../../context/AnnotationContext";
import { faIcon } from "../../icon";
export const ColumnSorterIndicator = ({ column }) => {
    const { annotationState } = useContext(AnnotationContext);
    const sorter = annotationState.filter.sorter;
    if (!_.isNil(sorter) && _.isEqual(column.key, sorter.key)) {
        return (
            <Icon
                icon={faIcon({
                    style: { marginRight: 3 },
                    icon: sorter.desc ? faCaretDown : faCaretUp,
                })}
            />
        );
    }
    return null;
};
