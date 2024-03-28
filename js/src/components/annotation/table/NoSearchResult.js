import { NonIdealState } from "@blueprintjs/core";
import { faSearch } from "@fortawesome/pro-duotone-svg-icons";
import { faIcon } from "../../icon";
export const NoSearchResult = () => {
    return (
        <NonIdealState
            icon={faIcon({ icon: faSearch, size: 30 })}
            title="No search results"
            description={
                <span>
                    Your search didn&apos;t match any records.
                    <br />
                    Try searching for something else.
                </span>
            }
        />
    );
};
