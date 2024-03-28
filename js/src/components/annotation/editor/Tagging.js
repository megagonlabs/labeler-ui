import {
    Button,
    Divider,
    Menu,
    MenuItem,
    Popover,
    Tag,
} from "@blueprintjs/core";
import { faUserTag } from "@fortawesome/pro-duotone-svg-icons";
import _ from "lodash";
import { useContext, useEffect, useState } from "react";
import {
    DEFAULT_ANNOTATOR,
    LABEL_SCHEMA_OKP,
    RECORD_LEVEL_LABEL_OKP,
} from "../../constant";
import { AnnotationContext } from "../../context/AnnotationContext";
import { faIcon } from "../../icon";
export const Tagging = () => {
    const { annotationState, annotationAction } = useContext(AnnotationContext);
    const [labelNameValue, setLabelNameValue] = useState({});
    const [availableTags, setAvailableTags] = useState([]);
    useEffect(() => {
        let newLabelNameValue = {};
        _.get(
            annotationState,
            ["data", annotationState.dataFocusIndex, ...RECORD_LEVEL_LABEL_OKP],
            []
        ).forEach(
            (record) =>
                (newLabelNameValue[record.label_name] = record.label_value[0])
        );
        const newAvailableTags = _.get(
            annotationState,
            LABEL_SCHEMA_OKP,
            []
        ).filter((schema) => {
            return schema.tagging && !_.has(newLabelNameValue, schema.name);
        });
        setAvailableTags(newAvailableTags);
        setLabelNameValue(newLabelNameValue);
    }, [annotationState.dataFocusIndex, annotationState.data]);
    const handleTagChange = (value, labelName) => {
        let found = false;
        let newData = [..._.get(annotationState, "data", [])];
        newData = newData.map((datapoint, index) => {
            if (!_.isEqual(index, annotationState.dataFocusIndex))
                return datapoint;
            let labelRecord = _.get(datapoint, [...RECORD_LEVEL_LABEL_OKP], [])
                .filter((record) => {
                    if (
                        _.isNil(value) &&
                        _.isEqual(record.label_name, labelName)
                    )
                        return false;
                    return true;
                })
                .map((record) => {
                    if (!_.isEqual(record.label_name, labelName)) return record;
                    found = true;
                    record.label_value = [value];
                    return record;
                });
            if (!found && !_.isNil(value)) {
                labelRecord.push({
                    label_name: labelName,
                    label_value: [value],
                    label_level: "record",
                });
            }
            _.set(
                datapoint,
                ["annotation_list", 0, "annotator"],
                _.get(
                    annotationState,
                    "config.annotator.user_id",
                    DEFAULT_ANNOTATOR.user_id
                )
            );
            return _.set(datapoint, [...RECORD_LEVEL_LABEL_OKP], labelRecord);
        });
        annotationAction.setData(newData);
    };
    return (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Popover
                disabled={_.isEmpty(availableTags)}
                minimal
                content={
                    <Menu>
                        {availableTags.map((schema, tagIdx) => {
                            const hasValue = _.has(labelNameValue, schema.name);
                            if (!hasValue) {
                                return (
                                    <MenuItem
                                        key={`tagging-tags-${tagIdx}`}
                                        text={schema.name}
                                    >
                                        {schema.options.map(
                                            (option, optionIdx) => (
                                                <MenuItem
                                                    key={`tagging-tags-option-${optionIdx}`}
                                                    text={option.text}
                                                    labelElement={
                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    "bolder",
                                                            }}
                                                        >
                                                            {option.value}
                                                        </span>
                                                    }
                                                    onClick={() =>
                                                        handleTagChange(
                                                            option.value,
                                                            schema.name
                                                        )
                                                    }
                                                />
                                            )
                                        )}
                                    </MenuItem>
                                );
                            }
                        })}
                    </Menu>
                }
                position="bottom-left"
            >
                <Button
                    style={{ marginRight: 7, marginBottom: 4 }}
                    minimal
                    outlined
                    disabled={_.isEmpty(availableTags)}
                    text="Add new tag"
                    icon={faIcon({ icon: faUserTag })}
                />
            </Popover>
            {Array.from(
                _.get(annotationState, "tagSchemaNames", new Set())
            ).map((tagName, tagIndex) => {
                if (_.has(labelNameValue, tagName)) {
                    const tagStyle = _.get(
                        annotationState,
                        [
                            "labelTagStyles",
                            tagName,
                            labelNameValue[tagName],
                            "minimal",
                        ],
                        {}
                    );
                    return (
                        <Popover
                            key={`tagging-popover-${tagIndex}`}
                            position="bottom-left"
                            content={
                                <Menu>
                                    {_.get(
                                        annotationState,
                                        ["labelNameOptions", tagName],
                                        []
                                    )
                                        .filter(
                                            (option) =>
                                                !_.isEqual(
                                                    option.value,
                                                    labelNameValue[tagName]
                                                )
                                        )
                                        .map((option, index) => (
                                            <MenuItem
                                                key={`tagging-popover-menuitem-${index}`}
                                                text={option.text}
                                                labelElement={
                                                    <span
                                                        style={{
                                                            fontWeight:
                                                                "bolder",
                                                        }}
                                                    >
                                                        {option.value}
                                                    </span>
                                                }
                                                onClick={() =>
                                                    handleTagChange(
                                                        option.value,
                                                        tagName
                                                    )
                                                }
                                            />
                                        ))}
                                </Menu>
                            }
                        >
                            <Tag
                                onRemove={() => handleTagChange(null, tagName)}
                                large
                                interactive
                                minimal
                                style={{
                                    ...tagStyle,
                                    marginRight: 7,
                                    marginBottom: 4,
                                }}
                            >
                                <span
                                    style={{ display: "flex" }}
                                    key={`tagging-popover-span-${tagIndex}`}
                                >
                                    {[
                                        tagName,
                                        <span
                                            key={`tagging-popover-span-tag-name-${tagIndex}`}
                                            style={{
                                                fontWeight: "bolder",
                                            }}
                                        >
                                            {labelNameValue[tagName]}
                                        </span>,
                                    ].reduce((prev, curr) => [
                                        prev,
                                        <Divider
                                            key={`tagging-popover-tag-divider-${tagIndex}`}
                                        />,
                                        curr,
                                    ])}
                                </span>
                            </Tag>
                        </Popover>
                    );
                }
            })}
        </div>
    );
};
