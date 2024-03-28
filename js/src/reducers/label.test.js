import _ from "lodash";
import {
    RECORD_LEVEL_LABELS_KEY,
    SPAN_LEVEL_LABELS_KEY,
} from "../components/constant";
import { reducer } from "../components/context/AnnotationContext";
const dummy_data = [
    { annotation_list: [], record_content: "text 1", uuid: 1 },
    { annotation_list: [], record_content: "text 2", uuid: 2 },
    { annotation_list: [], record_content: "text 3", uuid: 3 },
    { annotation_list: [], record_content: "text 4", uuid: 4 },
    { annotation_list: [], record_content: "text 5", uuid: 5 },
];
const dummy_label = {
    label_name: "test_label",
    label_value: ["test_value"],
};
describe("Annotation setters", () => {
    test("1. [BATCH_SET_RECORD_LEVEL_LABEL] sets multiple data points with the same label", () => {
        var data = _.cloneDeep(dummy_data);
        const action = {
            type: "BATCH_SET_RECORD_LEVEL_LABEL",
            payload: {
                type: "test_label",
                value: "test_value",
            },
        };

        const initialState = {
            widgetMode: "annotating",
            tagSchemaNames: new Set(),
            selectedDatapointIds: new Set([1, 2, 3]),
            originalData: dummy_data,
            data: dummy_data,
        };
        for (let i = 0; i < data.length; i++) {
            if (initialState.selectedDatapointIds.has(data[i].uuid)) {
                data[i].annotation_list = [
                    {
                        annotator: "labeler-ui",
                        [RECORD_LEVEL_LABELS_KEY]: [
                            { ...dummy_label, label_level: "record" },
                        ],
                    },
                ];
            }
        }
        expect(reducer(initialState, action)).toEqual({
            ...initialState,
            recentlyUpdatedDataIds: initialState.selectedDatapointIds,
            widgetMode: "annotating",
            data: data,
            originalData: data,
        });
    });
    test("2. [SET_NEW_LABEL] sets 1 data point with a span label", () => {
        var data = _.cloneDeep(dummy_data);
        const initialState = {
            dataFocusIndex: 0,
            data: dummy_data,
            widgetMode: "annotating",
            originalData: dummy_data,
        };
        const label = {
            ...dummy_label,
            label_level: "span",
            start_idx: 0,
            end_idx: 2,
        };
        const action = {
            type: "SET_NEW_LABEL",
            payload: {
                path: [SPAN_LEVEL_LABELS_KEY],
                label: label,
            },
        };
        data[0].annotation_list = [
            {
                annotator: "labeler-ui",
                [SPAN_LEVEL_LABELS_KEY]: [label],
            },
        ];
        expect(reducer(initialState, action)).toEqual({
            ...initialState,
            data: data,
            originalData: data,
            widgetMode: "annotating",
            recentlyUpdatedDataIds: new Set([1]),
        });
    });
});
