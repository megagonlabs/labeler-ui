import { Intent } from "@blueprintjs/core";
import isRegex from "is-regex";
import _ from "lodash";
import MiniSearch from "minisearch";
import { createContext, useReducer } from "react";
import RegexParser from "regex-parser";
import {
    ipySubsetAnnotations,
    separateTaggings,
    updateOriginalDataFromSource,
} from "../../reducers/data";
import {
    span_map_to_array,
    span_reconciliation_map,
} from "../../reducers/reconciliation";
import {
    DEFAULT_ANNOTATOR,
    DEFAULT_LABEL_COLOR_PALETTE,
    MINIMUM_WIDGET_VIEW_HEIGHT,
    MODE_LOOKUP_CODE,
    RECORD_LEVEL_LABELS_KEY,
    RECORD_LEVEL_LABEL_OKP,
    RECORD_LEVEL_SCHEMA_KEY,
    SPAN_LEVEL_LABELS_KEY,
    notebook_call,
    python_error_toast,
} from "../constant";
import { actionToaster, createToast } from "../toaster";
const LABEL_METADATA_LIST_KEY = "label_metadata_list";
const AnnotationContext = createContext();
const miniSearchOptions = {
    fields: ["record_content"],
    idField: "uuid",
};
const nonBlockingipySetCallback = (state, functionKey, payload) => {
    setTimeout(() => {
        if (!_.isNil(state[functionKey])) state[functionKey](payload);
    }, 0);
};
const isPotentialRegex = (s) => {
    try {
        const m = s.match(/^\/((?:\\\/|[^/])+)\/([gimsuy]{0,5})?$/);
        return m ? !!new RegExp(m[2], m[3]) : false;
    } catch (error) {
        return false;
    }
};
const reducer = (state, action) => {
    const { payload, type } = action;
    const currentLabel = _.get(state, "reconciliation.currentLabel", null);
    const widgetMode = state.widgetMode;
    switch (type) {
        case "SET_CONFIG": {
            let labelNameOptions = {},
                lastRecordLevelSchemaIndex = -1;
            var labelSchemas = _.get(payload, "label_schema", []);
            const tagSchemas = _.get(payload, "tag_schema", []);
            var existingLabelSchemas = new Set();
            for (let i = 0; i < labelSchemas.length; i++) {
                const schema = labelSchemas[i];
                existingLabelSchemas.add(schema.name);
                const labelName = _.get(schema, "name", null);
                const options = _.get(schema, "options", []);
                if (!(_.isNil(labelName) || _.isEmpty(options))) {
                    labelNameOptions[labelName] = options;
                }
                if (_.isEqual(schema.level, RECORD_LEVEL_SCHEMA_KEY))
                    lastRecordLevelSchemaIndex = i;
            }
            let newTagSchemaNames = new Set();
            for (let i = 0; i < tagSchemas.length; i++) {
                const schema = tagSchemas[i];
                if (!existingLabelSchemas.has(schema.name)) {
                    labelSchemas.push({
                        name: schema.name,
                        level: "record",
                        options: schema.options,
                        tagging: true,
                    });
                    const name = _.get(schema, "name", null);
                    if (!_.isNil(name)) newTagSchemaNames.add(name);
                    const options = _.get(schema, "options", []);
                    if (!(_.isNil(name) || _.isEmpty(options))) {
                        labelNameOptions[name] = options;
                    }
                }
            }
            _.set(payload, "label_schema", labelSchemas);
            let labelTagStyles = {};
            const labelNameOptionKeys = Object.keys(labelNameOptions);
            for (let i = 0; i < labelNameOptionKeys.length; i++) {
                const labelNameKey = labelNameOptionKeys[i];
                labelTagStyles[labelNameKey] = {};
                var newLabelOptions = labelNameOptions[labelNameKey];
                for (let j = 0; j < newLabelOptions.length; j++) {
                    labelTagStyles[labelNameKey][newLabelOptions[j]["value"]] =
                        DEFAULT_LABEL_COLOR_PALETTE.normal[j % 10];
                }
            }
            if (
                _.isUndefined(payload.height) ||
                Number(payload.height) < MINIMUM_WIDGET_VIEW_HEIGHT
            ) {
                payload.height = MINIMUM_WIDGET_VIEW_HEIGHT;
            }
            return {
                ...state,
                config: payload,
                tagSchemaNames: newTagSchemaNames,
                lastRecordLevelSchemaIndex: lastRecordLevelSchemaIndex,
                labelNameOptions: labelNameOptions,
                labelTagStyles: labelTagStyles,
            };
        }
        case "SET_DATA": {
            let data = payload;
            if (_.isNil(data)) data = [];
            let tempOriginalData = updateOriginalDataFromSource({
                updates: data,
                original: state.originalData,
            });
            var metadataNames = new Set();
            for (let i = 0; i < data.length; i++) {
                const metadata = _.get(data, [i, "record_metadata"], []);
                for (let j = 0; j < metadata.length; j++) {
                    const metadataName = metadata[j].name;
                    if (!_.isNil(metadataName)) metadataNames.add(metadataName);
                }
            }
            nonBlockingipySetCallback(
                state,
                "ipySetData",
                tempOriginalData.map((datapoint) =>
                    separateTaggings({
                        datapoint: datapoint,
                        tagSchemaNames: state.tagSchemaNames,
                    })
                )
            );
            return {
                ...state,
                data: data,
                originalData: tempOriginalData,
                metadataNames: metadataNames,
                dataFocusIndex: _.isEmpty(data)
                    ? -1
                    : Math.min(
                          data.length - 1,
                          Math.max(0, state.dataFocusIndex)
                      ),
            };
        }
        case "BATCH_SET_RECONCILIATION_LABEL": {
            var nextReconciliationData = _.cloneDeep(state.reconciliation.data);
            let nextRecentlyUpdatedIds = _.get(
                state,
                "recentlyUpdatedDataIds",
                new Set()
            );
            const batchOnIds = Array.from(state.selectedDatapointIds);
            for (let i = 0; i < batchOnIds.length; i++) {
                const uuid = batchOnIds[i];
                nextRecentlyUpdatedIds.add(uuid);
                _.set(
                    nextReconciliationData,
                    [uuid, payload.type, MODE_LOOKUP_CODE[widgetMode]],
                    !_.isNil(payload.value) ? [payload.value] : null
                );
            }
            return {
                ...state,
                recentlyUpdatedDataIds: nextRecentlyUpdatedIds,
                reconciliation: {
                    ...state.reconciliation,
                    data: nextReconciliationData,
                },
            };
        }
        case "BATCH_SET_RECORD_LEVEL_LABEL": {
            let tempBatchData = _.cloneDeep(_.get(state, "data", []));
            let nextRecentlyUpdatedState = _.get(
                state,
                "recentlyUpdatedDataIds",
                new Set()
            );
            tempBatchData = tempBatchData.map((datapoint) => {
                if (state.selectedDatapointIds.has(datapoint.uuid)) {
                    var ipy_payload = {};
                    _.set(ipy_payload, "uuid", datapoint.uuid);
                    nextRecentlyUpdatedState.add(datapoint.uuid);
                    let didOverwrite = false;
                    let newlabelValues = _.get(
                        datapoint,
                        RECORD_LEVEL_LABEL_OKP,
                        []
                    )
                        .filter((label) => {
                            if (
                                _.isNil(payload.value) &&
                                _.isEqual(label.label_name, payload.type)
                            )
                                return false;
                            return true;
                        })
                        .map((label) => {
                            if (!_.isEqual(label.label_name, payload.type))
                                return label;
                            didOverwrite = true;
                            label.label_value = [payload.value];
                            return label;
                        });
                    if (!didOverwrite && !_.isNil(payload.value)) {
                        newlabelValues.push({
                            label_name: payload.type,
                            label_value: [payload.value],
                            label_level: "record",
                        });
                    }
                    _.set(
                        datapoint,
                        ["annotation_list", 0, "annotator"],
                        _.get(
                            state,
                            "config.annotator.user_id",
                            DEFAULT_ANNOTATOR.user_id
                        )
                    );
                    _.set(datapoint, RECORD_LEVEL_LABEL_OKP, newlabelValues);
                    _.set(
                        ipy_payload,
                        "labels",
                        _.get(datapoint, ["annotation_list", 0])
                    );
                    if (_.get(state, "hasSubmit", false)) {
                        const label_json_loads = `json.loads('${JSON.stringify(
                            ipy_payload.labels
                        )}')`;
                        const set_annotation_command = `LabelerSubset.${_.get(
                            state,
                            ["ipy_interface", "subset"]
                        )}.set_annotations(uuid='${
                            ipy_payload.uuid
                        }', labels=${label_json_loads})`;
                        notebook_call(
                            set_annotation_command,
                            _.get(state, "ipy_interface.kernel_id")
                        ).catch((error) =>
                            python_error_toast({
                                code: set_annotation_command,
                                message: "Unable to set annotation(s).",
                                error: error,
                            })
                        );
                    }
                }
                return datapoint;
            });
            let newOriginaBatchlData = updateOriginalDataFromSource({
                updates: tempBatchData,
                original: state.originalData,
            });
            nonBlockingipySetCallback(
                state,
                "ipySetData",
                newOriginaBatchlData.map((datapoint) =>
                    separateTaggings({
                        datapoint: datapoint,
                        tagSchemaNames: state.tagSchemaNames,
                    })
                )
            );
            return {
                ...state,
                data: tempBatchData,
                recentlyUpdatedDataIds: nextRecentlyUpdatedState,
                originalData: newOriginaBatchlData,
            };
        }
        case "SET_NEW_LABEL": {
            const { label } = payload;
            let tempData = _.cloneDeep(_.get(state, "data", []));
            const NEW_LABEL_PATH = [state.dataFocusIndex, "annotation_list", 0];
            const labelValues = _.get(
                tempData,
                [...NEW_LABEL_PATH, ...payload.path],
                []
            );
            if (_.isNil(label))
                _.set(tempData, [...NEW_LABEL_PATH, ...payload.path], []);
            else {
                _.set(
                    tempData,
                    [...NEW_LABEL_PATH, ...payload.path],
                    [...labelValues, label]
                );
            }
            _.set(
                tempData,
                [...NEW_LABEL_PATH, "annotator"],
                _.get(
                    state,
                    "config.annotator.user_id",
                    DEFAULT_ANNOTATOR.user_id
                )
            );
            let newOriginalData = updateOriginalDataFromSource({
                updates: tempData,
                original: state.originalData,
            });
            let tempRecentlyUpdatedState = _.get(
                state,
                "recentlyUpdatedDataIds",
                new Set()
            );
            const updatedUUID = _.get(
                tempData,
                [state.dataFocusIndex, "uuid"],
                null
            );
            if (!_.isNil(updatedUUID))
                tempRecentlyUpdatedState.add(updatedUUID);
            nonBlockingipySetCallback(state, "ipySetData", newOriginalData);
            ipySubsetAnnotations({
                state,
                payload: {
                    uuid: updatedUUID,
                    labels: _.get(tempData, NEW_LABEL_PATH, null),
                },
            });
            return {
                ...state,
                data: tempData,
                originalData: newOriginalData,
                recentlyUpdatedDataIds: tempRecentlyUpdatedState,
            };
        }
        case "SET_STATE_BY_KEY": {
            const { key, value } = payload;
            return { ...state, [key]: value };
        }
        case "SET_SELECTED_ROW_INDEX": {
            var newSelectedDatapointIds = new Set(state.selectedDatapointIds);
            const id = _.get(state, ["data", payload.rowIndex, "uuid"], null);
            if (!_.isNil(id)) {
                if (payload.checked) newSelectedDatapointIds.add(id);
                else newSelectedDatapointIds.delete(id);
            }
            return {
                ...state,
                selectedDatapointIds: newSelectedDatapointIds,
                tableCheckboxChecked: newSelectedDatapointIds.size > 0,
            };
        }
        case "SET_TABLE_CHECKBOX_CHECKED": {
            let newSelectedDatapointIds = new Set();
            if (payload)
                newSelectedDatapointIds = new Set(
                    state.data.map((datapoint) => datapoint.uuid)
                );
            return {
                ...state,
                tableCheckboxChecked: payload,
                selectedDatapointIds: newSelectedDatapointIds,
            };
        }
        case "INDEX_DOCUMENTS": {
            let indexedDocs = new Set(state.indexedDocuments);
            let newMiniSearch = new MiniSearch(miniSearchOptions);
            if (!_.isNil(state.miniSearch)) newMiniSearch = state.miniSearch;
            const newDocs = payload.filter((doc) => !indexedDocs.has(doc.uuid));
            for (let i = 0; i < newDocs.length; i++) {
                const doc = newDocs[i];
                if (!_.isUndefined(doc.uuid)) indexedDocs.add(doc.uuid);
            }
            newMiniSearch.addAll(newDocs);
            // index label metadata
            let labelMetadata = {};
            for (let i = 0; i < payload.length; i++) {
                const uuid = payload[i].uuid,
                    record_labels = _.get(
                        payload,
                        [i, ...RECORD_LEVEL_LABEL_OKP],
                        []
                    );
                for (let j = 0; j < record_labels.length; j++) {
                    const metadata_list = _.get(
                        record_labels,
                        [j, LABEL_METADATA_LIST_KEY],
                        []
                    );
                    for (let k = 0; k < metadata_list.length; k++) {
                        const metadata = metadata_list[k];
                        _.set(
                            labelMetadata,
                            [uuid, record_labels[j].label_name, metadata.name],
                            {
                                type: _.isNumber(metadata.value)
                                    ? "number"
                                    : "string",
                                value: metadata.value,
                            }
                        );
                    }
                }
            }
            return {
                ...state,
                isIndexingDocuments: false,
                miniSearch: newMiniSearch,
                indexedDocuments: indexedDocs,
                labelMetadata: labelMetadata,
            };
        }
        case "ON_FILTER_CHANGE": {
            const userQuery = _.isUndefined(payload.query) ? "" : payload.query;
            let filteredResult = [],
                isRegexQuery = false,
                searchMode = "fuzzy",
                searchTerms = [];
            if (_.isEmpty(userQuery)) {
                filteredResult = state.originalData;
            } else {
                isRegexQuery = false;
                try {
                    if (isPotentialRegex(userQuery))
                        isRegexQuery = isRegex(RegexParser(userQuery));
                } catch (error) {
                    actionToaster.show(
                        createToast({
                            intent: Intent.DANGER,
                            message: error.name + ": " + error.message,
                        })
                    );
                }
                const quoted =
                    userQuery.startsWith('"') && userQuery.endsWith('"');
                const exactMatchTerms = userQuery.match(
                    /((?<![\\])["])(?:[^"\\]*(?:\\.)?)*"/gmu
                );
                if (isRegexQuery) {
                    searchMode = "regex";
                    const regexQuery = RegexParser(userQuery);
                    let pushedTerms = new Set();
                    filteredResult = _.get(state, "originalData", []).filter(
                        (datapoint) => {
                            const matchedStrings =
                                datapoint.record_content.match(regexQuery);
                            if (_.isNil(matchedStrings)) {
                                for (
                                    let i = 0;
                                    i < matchedStrings.length;
                                    i++
                                ) {
                                    if (pushedTerms.has(matchedStrings[i]))
                                        continue;
                                    pushedTerms.add(matchedStrings[i]);
                                    searchTerms.push(matchedStrings[i]);
                                }
                            }
                            return regexQuery.test(datapoint.record_content);
                        }
                    );
                } else if (quoted && !_.isEmpty(exactMatchTerms)) {
                    searchMode = "exact";
                    let terms = exactMatchTerms
                        .map((term) => term.slice(1, -1))
                        .filter((term) => term.trim().length > 0);
                    filteredResult = _.get(state, "originalData", []).filter(
                        (datapoint) => {
                            for (let i = 0; i < terms.length; i++) {
                                if (
                                    _.isEqual(
                                        _.get(datapoint, "record_content", "")
                                            .toLowerCase()
                                            .indexOf(terms[i]),
                                        -1
                                    )
                                )
                                    return false;
                            }
                            return true;
                        }
                    );
                    searchTerms = terms;
                } else {
                    searchMode = "fuzzy";
                    const searchOptions = {
                        prefix: (term) => term.length >= 2,
                        fuzzy: (term) => (term.length > 3 ? 0.2 : null),
                    };
                    let result = state.miniSearch.search(
                        userQuery,
                        searchOptions
                    );
                    let filteredIds = [],
                        pushedTerms = new Set();
                    for (let i = 0; i < result.length; i++) {
                        filteredIds.push(result[i].id);
                        const docTerms = result[i].terms;
                        for (let j = 0; j < docTerms.length; j++) {
                            if (pushedTerms.has(docTerms[j])) continue;
                            pushedTerms.add(docTerms[j]);
                            searchTerms.push(docTerms[j]);
                        }
                    }
                    filteredResult = _.get(state, "originalData", []).filter(
                        (datapoint) =>
                            filteredIds.includes(datapoint.uuid) ||
                            _.isEqual(datapoint.uuid, userQuery.trim())
                    );
                }
            }
            if (!_.isUndefined(payload.sorter)) {
                const { path, desc, type, mode } = payload.sorter;
                filteredResult.sort((left, right) => {
                    if (_.isEqual(mode, "DIRECT_VALUE")) {
                        const a = _.get(left, path, ""),
                            b = _.get(right, path, "");
                        if (_.isEqual(type, "string"))
                            return a.localeCompare(b);
                    } else if (_.isEqual("LABEL_METADATA_VALUE", mode)) {
                        const a = _.get(state, [
                                "labelMetadata",
                                left.uuid,
                                ...path,
                            ]),
                            b = _.get(state, [
                                "labelMetadata",
                                right.uuid,
                                ...path,
                            ]);
                        if (
                            !_.isNil(a) &&
                            !_.isNil(b) &&
                            _.isEqual(a.type, b.type) &&
                            _.includes(["number", "string"], a.type)
                        ) {
                            if (_.isEqual(a.type, "number")) {
                                return a.value - b.value;
                            } else if (_.isEqual(a.type, "string")) {
                                return a.value.localeCompare(b.value);
                            }
                        } else {
                            // not the same type compare, treat as string
                            return _.toString(
                                _.get(a, "value", null)
                            ).localeCompare(
                                _.toString(_.get(b, "value", null))
                            );
                        }
                    } else if (_.isEqual("LABEL_VALUE", mode)) {
                        let endIdx = -1,
                            keyName = "label_value";
                        const labelPath = path.slice(0, endIdx),
                            [labelName] = path.slice(endIdx);
                        const a = _.get(
                                _.get(left, labelPath, []).filter((cur) =>
                                    _.isEqual(cur.label_name, labelName)
                                ),
                                [0, keyName],
                                []
                            ),
                            b = _.get(
                                _.get(right, labelPath, []).filter((cur) =>
                                    _.isEqual(cur.label_name, labelName)
                                ),
                                [0, keyName],
                                []
                            );
                        for (let i = 0; i < Math.max(a.length, b.length); i++) {
                            const itemA = _.get(a, i, ""),
                                itemB = _.get(b, i, "");
                            if (_.isEqual(type, "string"))
                                return itemA.localeCompare(itemB);
                        }
                    } else if (
                        [
                            "reconciling",
                            "verifying",
                            "verifying-readonly",
                        ].includes(mode)
                    ) {
                        const leftId = _.get(left, "uuid", null),
                            rightId = _.get(right, "uuid", null);
                        if (
                            !_.isNil(currentLabel) &&
                            !_.isNil(leftId) &&
                            !_.isNil(rightId)
                        ) {
                            const leftValue = _.get(
                                    state,
                                    [
                                        "reconciliation",
                                        "data",
                                        leftId,
                                        currentLabel,
                                        MODE_LOOKUP_CODE[mode],
                                    ],
                                    []
                                ),
                                rightValue = _.get(
                                    state,
                                    [
                                        "reconciliation",
                                        "data",
                                        rightId,
                                        currentLabel,
                                        MODE_LOOKUP_CODE[mode],
                                    ],
                                    []
                                );
                            for (
                                let i = 0;
                                i <
                                Math.max(leftValue.length, rightValue.length);
                                i++
                            ) {
                                const itemA = _.get(leftValue, i, ""),
                                    itemB = _.get(rightValue, i, "");
                                if (_.isEqual(type, "string"))
                                    return itemA.localeCompare(itemB);
                            }
                        }
                    } else if (_.isEqual(mode, "selected_first")) {
                        const leftId = _.get(left, "uuid", null),
                            rightId = _.get(right, "uuid", null),
                            selectedIds = _.get(
                                state,
                                "selectedDatapointIds",
                                new Set()
                            );
                        if (leftId != null && rightId != null) {
                            const leftValue = selectedIds.has(leftId),
                                rightValue = selectedIds.has(rightId);
                            return rightValue - leftValue;
                        }
                    } else if (_.isEqual(mode, "unverified_first")) {
                        const verificationHistory = _.get(
                            state,
                            ["verificationHistory", currentLabel],
                            {}
                        );
                        const verifiedIds = new Set(
                            Object.keys(verificationHistory).filter(
                                (e) =>
                                    !_.isEmpty(
                                        _.get(verificationHistory, e, [])
                                    )
                            )
                        );
                        const leftId = _.get(left, "uuid", null),
                            rightId = _.get(right, "uuid", null);
                        if (leftId != null && rightId != null) {
                            const leftValue = verifiedIds.has(leftId),
                                rightValue = verifiedIds.has(rightId);
                            return leftValue - rightValue;
                        }
                    }
                });
                if (desc) filteredResult = filteredResult.reverse();
            }
            if (!_.isUndefined(payload.column)) {
                filteredResult = filteredResult.filter((result) => {
                    let shouldInclude = [];
                    const payloadColumnKeys = Object.keys(payload.column);
                    for (let i = 0; i < payloadColumnKeys.length; i++) {
                        const labelType = payloadColumnKeys[i];
                        if (_.isEmpty(payload.column[labelType]))
                            shouldInclude.push(true);
                        else {
                            var recordLabels = [];
                            if (_.isEqual(widgetMode, "annotating")) {
                                recordLabels = _.get(
                                    result,
                                    RECORD_LEVEL_LABEL_OKP,
                                    []
                                );
                            } else if (
                                ["reconciling", "verifying"].includes(
                                    widgetMode
                                )
                            ) {
                                recordLabels = _.get(
                                    state,
                                    [
                                        "reconciliation",
                                        "data",
                                        _.get(result, "uuid", null),
                                        labelType,
                                        MODE_LOOKUP_CODE[widgetMode],
                                    ],
                                    []
                                ).map((value) => ({
                                    label_name: labelType,
                                    label_value: [value],
                                    label_level: "record",
                                }));
                            }
                            if (_.isEmpty(recordLabels))
                                shouldInclude.push(false);
                            else {
                                let foundMatch = false;
                                for (let j = 0; j < recordLabels.length; j++) {
                                    const label = recordLabels[j];
                                    if (
                                        _.isEqual(label.label_name, labelType)
                                    ) {
                                        foundMatch =
                                            _.intersection(
                                                label.label_value,
                                                payload.column[labelType]
                                            ).length > 0;
                                    }
                                }
                                shouldInclude.push(foundMatch);
                            }
                        }
                    }
                    return (
                        _.isEmpty(shouldInclude) ||
                        _.isEmpty(shouldInclude.filter((state) => !state))
                    );
                });
            }
            return {
                ...state,
                filter: {
                    ...state.filter,
                    mode: searchMode,
                    query: userQuery,
                    column: payload.column,
                    sorter: payload.sorter,
                    highlightWords: searchTerms,
                },
                ...(payload.justSort
                    ? {}
                    : {
                          selectedDatapointIds: new Set(),
                          tableCheckboxChecked: false,
                      }),
                dataFocusIndex: _.isEmpty(filteredResult) ? -1 : 0,
                data: [...filteredResult],
            };
        }
        case "UPDATE_SUBMISSION_AUDIT": {
            let newSubmissionAudit = { ...state.submissionAudit };
            _.set(newSubmissionAudit, payload.uuid, {
                ...payload.content,
                timestamp: new Date(),
            });
            return { ...state, submissionAudit: newSubmissionAudit };
        }
        case "SET_RECENTLY_UPDATED_STATUS": {
            let newRecentlyUpdatedState = _.get(
                state,
                "recentlyUpdatedDataIds",
                new Set()
            );
            if (!_.isNil(payload.uuids)) {
                if (_.isEqual(payload.state, "updated")) {
                    for (let i = 0; i < payload.uuids.length; i++)
                        newRecentlyUpdatedState.add(payload.uuids[i]);
                } else if (_.isEqual(payload.state, "submitted")) {
                    for (let i = 0; i < payload.uuids.length; i++)
                        newRecentlyUpdatedState.delete(payload.uuids[i]);
                }
            }
            return {
                ...state,
                recentlyUpdatedDataIds: newRecentlyUpdatedState,
            };
        }
        case "SELECT_RECENTLY_UPDATED": {
            const shouldAnyChecked = _.get(
                state,
                "recentlyUpdatedDataIds",
                new Set()
            );
            var intersection = new Set();
            for (let i = 0; i < state.data.length; i++) {
                const datapoint = state.data[i];
                const uuid = _.get(datapoint, "uuid", null);
                if (!_.isNil(uuid) && shouldAnyChecked.has(uuid))
                    intersection.add(datapoint.uuid);
            }
            return {
                ...state,
                tableCheckboxChecked: intersection.size > 0,
                selectedDatapointIds: intersection,
            };
        }
        case "SELECT_DATA_WITH_SUBMISSION_ERROR": {
            var dataWithError = new Set();
            for (let auditKey in state.submissionAudit) {
                if (
                    _.isEqual(state.submissionAudit[auditKey]["state"], "error")
                )
                    dataWithError.add(auditKey);
            }
            return {
                ...state,
                selectedDatapointIds: dataWithError,
                tableCheckboxChecked: dataWithError.size > 0,
            };
        }
        case "TRACK_NETWORK_REQUEST": {
            let newState = { ...state };
            newState.networkRequests[payload.state] += payload.count;
            if (
                _.isEqual(
                    newState.networkRequests.queued,
                    newState.networkRequests.completed
                )
            ) {
                newState.networkRequests.queued = 0;
                newState.networkRequests.completed = 0;
            }
            return newState;
        }
        case "SET_VERIFICATION_HISTORY": {
            let newVerificationHistory = {},
                newReconciliationState = _.cloneDeep(state.reconciliation.data);
            for (let i = 0; i < payload.list.length; i++) {
                const item = payload.list[i];
                _.set(
                    newVerificationHistory,
                    [currentLabel, item["uuid"]],
                    item["verification_list"]
                );
                // repopulate existing verification values for local annotator
                if (!_.isEmpty(item.verification_list)) {
                    for (let j = 0; j < item.verification_list.length; j++) {
                        if (
                            _.isEqual(
                                item.verification_list[j].verifier,
                                state.config.annotator.user_id
                            )
                        ) {
                            _.set(
                                newReconciliationState,
                                [item["uuid"], currentLabel, "verification"],
                                _.get(
                                    item.verification_list[j],
                                    ["labels", 0, "label_value"],
                                    []
                                )
                            );
                            break;
                        }
                    }
                }
            }
            return {
                ...state,
                verificationHistory: newVerificationHistory,
                reconciliation: {
                    ...state.reconciliation,
                    data: newReconciliationState,
                },
            };
        }
        case "MAP_VERIFICATION_LABELS": {
            let newReconciliationState = _.cloneDeep(state.reconciliation.data);
            for (let i = 0; i < state.data.length; i++) {
                const datapoint = state.data[i];
                const annotation_labels = _.get(
                    datapoint,
                    RECORD_LEVEL_LABEL_OKP,
                    []
                );
                if (_.isNil(annotation_labels) || _.isNil(datapoint.uuid))
                    continue;
                for (let j = 0; j < annotation_labels.length; j++) {
                    const cur_label = annotation_labels[j];
                    if (
                        _.isUndefined(cur_label.label_name) ||
                        _.isUndefined(cur_label.label_value)
                    )
                        continue;
                    _.set(
                        newReconciliationState,
                        [
                            datapoint.uuid,
                            cur_label.label_name,
                            "verification-readonly",
                        ],
                        cur_label.label_value
                    );
                }
            }
            return {
                ...state,
                reconciliation: {
                    ...state.reconciliation,
                    data: newReconciliationState,
                },
            };
        }
        case "BUILD_RECONCILIATION_MAP": {
            let newReconciliationState = _.cloneDeep(state.reconciliation.data);
            for (let i = 0; i < payload.length; i++) {
                const data = payload[i];
                const annotation_list = _.get(data, ["annotation_list"]);
                const uuid = _.get(data, "uuid", null);
                if (_.isNil(uuid)) continue;
                var labels = _.get(newReconciliationState, [uuid], {});
                if (_.isNil(labels)) labels = {};
                let span_recon_map = {};
                for (let j = 0; j < annotation_list.length; j++) {
                    const target = annotation_list[j];
                    if (_.isUndefined(target.annotator)) continue;
                    const record_annotation_labels = _.get(
                        target,
                        RECORD_LEVEL_LABELS_KEY,
                        []
                    );
                    for (let k = 0; k < record_annotation_labels.length; k++) {
                        const cur_label = record_annotation_labels[k];
                        if (
                            _.isUndefined(cur_label.label_name) ||
                            _.isUndefined(cur_label.label_value)
                        )
                            continue;
                        _.set(
                            labels,
                            [cur_label.label_name, target.annotator],
                            cur_label.label_value
                        );
                    }
                    const span_annotation_labels = _.get(
                        target,
                        SPAN_LEVEL_LABELS_KEY,
                        []
                    );
                    for (let k = 0; k < span_annotation_labels.length; k++) {
                        const cur_label = span_annotation_labels[k];
                        span_recon_map = span_reconciliation_map({
                            label: cur_label,
                            recon_map: span_recon_map,
                            annotator: target.annotator,
                        });
                    }
                }
                labels = {
                    ...labels,
                    ...span_map_to_array(span_recon_map),
                };
                _.set(
                    newReconciliationState,
                    [uuid],
                    _.isEmpty(labels) ? null : labels
                );
            }
            return {
                ...state,
                reconciliation: {
                    ...state.reconciliation,
                    data: newReconciliationState,
                },
            };
        }
        case "SET_IPY_SUBSET_ANNOTATIONS": {
            ipySubsetAnnotations({ state, payload });
            return { ...state };
        }
        case "UPDATE_UID_MAPPING": {
            return { ...state, uidMap: _.merge(state.uidMap, payload) };
        }
        default:
            return { ...state };
    }
};
const initialState = {
    data: [],
    hasSubmit: false,
    columns: {},
    originalData: [],
    isIndexingDocuments: false,
    config: {},
    selectedDatapointIds: new Set(),
    dataFocusIndex: -1,
    lastRecordLevelSchemaIndex: -1,
    labelNameOptions: {},
    tagSchemaNames: new Set(),
    metadataNames: new Set(),
    tableCheckboxChecked: false,
    filter: { query: "", highlightWords: [] },
    labelTagStyles: {},
    indexedDocuments: new Set(),
    miniSearch: null,
    ipySetData: null,
    submissionAudit: {},
    recentlyUpdatedDataIds: new Set(),
    networkRequests: { completed: 0, queued: 0 },
    verificationHistory: {},
    widgetMode: "annotating",
    reconciliation: { data: {}, currentLabel: null },
    settings: {},
};
const AnnotationProvider = (props) => {
    const [annotationState, dispatch] = useReducer(reducer, initialState);
    const action = {
        trackNetworkRequest: (payload) =>
            dispatch({ type: "TRACK_NETWORK_REQUEST", payload: payload }),
        setConfig: (config) =>
            dispatch({ type: "SET_CONFIG", payload: config }),
        setData: (data) => dispatch({ type: "SET_DATA", payload: data }),
        updateSubmissionAudit: (payload) =>
            dispatch({ type: "UPDATE_SUBMISSION_AUDIT", payload: payload }),
        setSelectedRowIndex: (payload) =>
            dispatch({
                type: "SET_SELECTED_ROW_INDEX",
                payload: payload,
            }),
        mapVerificationLabels: () =>
            dispatch({
                type: "MAP_VERIFICATION_LABELS",
            }),
        buildReconciliationMap: (payload) => {
            var uids = new Set();
            for (let i = 0; i < payload.length; i++) {
                const data = payload[i];
                const annotation_list = _.get(data, "annotation_list", []);
                for (let j = 0; j < annotation_list.length; j++) {
                    const target = annotation_list[j];
                    if (_.isUndefined(target.annotator)) continue;
                    uids.add(target.annotator);
                }
            }
            const get_user_names_command = `LabelerSubset.${_.get(
                annotationState,
                "ipy_interface.service"
            )}.get_users_by_uids(uids=${JSON.stringify(Array.from(uids))})`;
            notebook_call(
                get_user_names_command,
                _.get(annotationState, "ipy_interface.kernel_id")
            ).then((result) => {
                dispatch({
                    type: "UPDATE_UID_MAPPING",
                    payload: JSON.parse(result),
                });
            });
            dispatch({
                type: "BUILD_RECONCILIATION_MAP",
                payload: payload,
            });
        },
        setTableCheckboxChecked: (checked) =>
            dispatch({ type: "SET_TABLE_CHECKBOX_CHECKED", payload: checked }),
        onFilterChange: (filter) =>
            dispatch({ type: "ON_FILTER_CHANGE", payload: filter }),
        indexDocuments: (payload) =>
            dispatch({ type: "INDEX_DOCUMENTS", payload: payload }),
        setStateByKey: (keyValue) =>
            dispatch({ type: "SET_STATE_BY_KEY", payload: keyValue }),
        setNewLabel: (label) =>
            dispatch({ type: "SET_NEW_LABEL", payload: label }),
        selectDataWithSubmissionError: () =>
            dispatch({ type: "SELECT_DATA_WITH_SUBMISSION_ERROR" }),
        selectRecentlyUpdated: () =>
            dispatch({ type: "SELECT_RECENTLY_UPDATED" }),
        setRecentlyUpdatedStatus: (payload) =>
            dispatch({ type: "SET_RECENTLY_UPDATED_STATUS", payload: payload }),
        setIpySubsetAnnotations: (payload) =>
            dispatch({ type: "SET_IPY_SUBSET_ANNOTATIONS", payload: payload }),
        batchSetRecordLevelLabel: (payload) =>
            dispatch({
                type: "BATCH_SET_RECORD_LEVEL_LABEL",
                payload: payload,
            }),
        batchSetReconciliationLabel: (payload) =>
            dispatch({
                type: "BATCH_SET_RECONCILIATION_LABEL",
                payload: payload,
            }),
        setVerificationHistory: (payload) => {
            var uids = new Set();
            for (let i = 0; i < payload.list.length; i++) {
                const data = payload.list[i];
                const verification_list = _.get(data, "verification_list", []);
                for (let j = 0; j < verification_list.length; j++) {
                    const target = verification_list[j];
                    if (!_.isNil(target.annotator)) uids.add(target.annotator);
                    if (!_.isNil(target.verifier)) uids.add(target.verifier);
                }
            }
            const get_user_names_command = `LabelerSubset.${_.get(
                annotationState,
                "ipy_interface.service"
            )}.get_users_by_uids(uids=${JSON.stringify(Array.from(uids))})`;
            notebook_call(
                get_user_names_command,
                _.get(annotationState, "ipy_interface.kernel_id")
            ).then((result) => {
                dispatch({
                    type: "UPDATE_UID_MAPPING",
                    payload: JSON.parse(result),
                });
            });
            dispatch({
                type: "SET_VERIFICATION_HISTORY",
                payload: payload,
            });
        },
        updateUidMapping: (payload) =>
            dispatch({ type: "UPDATE_UID_MAPPING", payload: payload }),
    };
    return (
        <AnnotationContext.Provider
            value={{
                annotationState: annotationState,
                annotationAction: action,
            }}
        >
            {props.children}
        </AnnotationContext.Provider>
    );
};
export { AnnotationContext, AnnotationProvider, reducer };
