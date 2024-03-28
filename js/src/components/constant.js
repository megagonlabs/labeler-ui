import { Colors, Intent, Tag } from "@blueprintjs/core";
import { faPython } from "@fortawesome/free-brands-svg-icons";
import {
    faBadgeCheck,
    faCircleCheck,
    faTriangleExclamation,
} from "@fortawesome/pro-duotone-svg-icons";
import { KernelManager, SessionAPI } from "@jupyterlab/services";
import copy from "copy-to-clipboard";
import _ from "lodash";
import { faIcon } from "./icon";
import { actionToaster, createToast } from "./toaster";
export const LABEL_AS_TEXT_MODE_LOOKUP = {
    annotating: "Label",
    reconciling: "Reconcile",
    verifying: "Verify",
};
export const HEX_TRANSPARENCY = {
    100: "FF",
    99: "FC",
    98: "FA",
    97: "F7",
    96: "F5",
    95: "F2",
    94: "F0",
    93: "ED",
    92: "EB",
    91: "E8",
    90: "E6",
    89: "E3",
    88: "E0",
    87: "DE",
    86: "DB",
    85: "D9",
    84: "D6",
    83: "D4",
    82: "D1",
    81: "CF",
    80: "CC",
    79: "C9",
    78: "C7",
    77: "C4",
    76: "C2",
    75: "BF",
    74: "BD",
    73: "BA",
    72: "B8",
    71: "B5",
    70: "B3",
    69: "B0",
    68: "AD",
    67: "AB",
    66: "A8",
    65: "A6",
    64: "A3",
    63: "A1",
    62: "9E",
    61: "9C",
    60: "99",
    59: "96",
    58: "94",
    57: "91",
    56: "8F",
    55: "8C",
    54: "8A",
    53: "87",
    52: "85",
    51: "82",
    50: "80",
    49: "7D",
    48: "7A",
    47: "78",
    46: "75",
    45: "73",
    44: "70",
    43: "6E",
    42: "6B",
    41: "69",
    40: "66",
    39: "63",
    38: "61",
    37: "5E",
    36: "5C",
    35: "59",
    34: "57",
    33: "54",
    32: "52",
    31: "4F",
    30: "4D",
    29: "4A",
    28: "47",
    27: "45",
    26: "42",
    25: "40",
    24: "3D",
    23: "3B",
    22: "38",
    21: "36",
    20: "33",
    19: "30",
    18: "2E",
    17: "2B",
    16: "29",
    15: "26",
    14: "24",
    13: "21",
    12: "1F",
    11: "1C",
    10: "1A",
    9: "17",
    8: "14",
    7: "12",
    6: "0F",
    5: "0D",
    4: "0A",
    3: "08",
    2: "05",
    1: "03",
    0: "00",
};
export const DEFAULT_ROW_HEIGHT = 39;
export const DEFAULT_COLUMN_CELL_ATTR = {
    width: 150,
    cellStyle: {
        lineHeight: DEFAULT_ROW_HEIGHT + "px",
    },
};
export const FIXED_COLUMN = ["table-column-data"];
export const HIDDEN_COLUMN_UNDER_RECONCILING = [
    "table-column-record-metadata-popover-view",
];
export const DEFAULT_COLUMN_STATE = {
    "table-column-last-submitted": {
        order: 0,
        width: 55,
    },
    "table-column-checkbox": {
        order: 1,
        width: 55,
    },
    "table-column-data": {
        order: 2,
        width: 300,
    },
    "table-column-reconciliation-summary": {
        order: 100,
        width: 300,
    },
    "table-column-record-metadata-popover-view": {
        order: 100,
        width: 300,
    },
};
export const MINIMUM_WIDGET_VIEW_HEIGHT = 500;
export const EXPANDABLE_CHARS = ["_", "'"];
export const LABEL_SCHEMA_OKP = ["config", "label_schema"];
export const TAG_SCHEMA_OKP = ["config", "tag_schema"];
export const SPAN_LEVEL_CHAR_SCHEMA_KEY = "span";
export const RECORD_LEVEL_SCHEMA_KEY = "record";
export const RECORD_LEVEL_LABELS_KEY = "labels_record";
export const SPAN_LEVEL_LABELS_KEY = "labels_span";
export const RECORD_LEVEL_LABEL_OKP = [
    "annotation_list",
    0,
    RECORD_LEVEL_LABELS_KEY,
];
export const labelValueSortedCount = (valueCount, totalCount) => {
    if (_.isEmpty(valueCount)) return null;
    var sortedCount = [];
    const countKeys = Object.keys(valueCount);
    for (let i = 0; i < countKeys.length; i++) {
        const individualCount = valueCount[countKeys[i]];
        sortedCount.push({
            key: countKeys[i],
            value: individualCount,
            percent: ((individualCount / totalCount) * 100).toFixed(2),
        });
    }
    sortedCount = sortedCount.sort((a, b) => b.value - a.value);
    for (let i = 0; i < countKeys.length; i++) {
        var borderStyles = {
            borderRadius: 0,
            borderRight: "2px solid rgba(115, 134, 148, 0.3)",
        };
        const first = _.isEqual(i, 0),
            last = _.isEqual(i, countKeys.length - 1);
        if (first && last) borderStyles = {};
        else if (first)
            borderStyles = {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRight: "2px solid rgba(115, 134, 148, 0.3)",
            };
        else if (last)
            borderStyles = {
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
            };
        _.set(sortedCount, [i, "style"], borderStyles);
    }
    return sortedCount;
};
export const DEFAULT_ANNOTATOR = {
    name: "labeler-ui",
    user_id: "labeler-ui",
};
export const GREEN_CHECK_COLOR = Colors.GREEN3;
export const MENU_ITEM_NO_STYLE = {
    textDecoration: "none",
    color: "inherit",
};
export const SEARCH_FORMAT_TAGS = {
    regex: (
        <Tag minimal intent="warning">
            regex
        </Tag>
    ),
    fuzzy: <Tag minimal>fuzzy</Tag>,
    exact: (
        <Tag
            minimal
            style={{
                color: Colors.INDIGO2,
                backgroundColor: `${Colors.INDIGO3}${HEX_TRANSPARENCY[15]}`,
            }}
        >
            exact
        </Tag>
    ),
};
export const DEFAULT_SPAN_HIGHLIGHT_COLOR = {
    backgroundColor: `${Colors.DARK_GRAY3}${HEX_TRANSPARENCY[15]}`,
    color: Colors.DARK_GRAY2,
};
export const DEFAULT_LABEL_COLOR_PALETTE = {
    normal: [
        {
            minimal: {
                backgroundColor: `${Colors.VERMILION3}${HEX_TRANSPARENCY[15]}`,
                color: Colors.VERMILION2,
            },
            regular: {
                backgroundColor: Colors.VERMILION3,
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `${Colors.VIOLET3}${HEX_TRANSPARENCY[15]}`,
                color: Colors.VIOLET2,
            },
            regular: {
                backgroundColor: Colors.VIOLET3,
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `${Colors.CERULEAN3}${HEX_TRANSPARENCY[15]}`,
                color: Colors.CERULEAN2,
            },
            regular: {
                backgroundColor: Colors.CERULEAN3,
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `${Colors.FOREST3}${HEX_TRANSPARENCY[15]}`,
                color: Colors.FOREST2,
            },
            regular: {
                backgroundColor: Colors.FOREST3,
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `${Colors.GOLD3}${HEX_TRANSPARENCY[15]}`,
                color: Colors.GOLD2,
            },
            regular: {
                backgroundColor: Colors.GOLD3,
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `${Colors.ROSE3}${HEX_TRANSPARENCY[15]}`,
                color: Colors.ROSE2,
            },
            regular: {
                backgroundColor: Colors.ROSE3,
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `${Colors.INDIGO3}${HEX_TRANSPARENCY[15]}`,
                color: Colors.INDIGO2,
            },
            regular: {
                backgroundColor: Colors.INDIGO3,
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `${Colors.TURQUOISE3}${HEX_TRANSPARENCY[15]}`,
                color: Colors.TURQUOISE2,
            },
            regular: {
                backgroundColor: Colors.TURQUOISE3,
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `${Colors.LIME3}${HEX_TRANSPARENCY[15]}`,
                color: Colors.LIME2,
            },
            regular: {
                backgroundColor: Colors.LIME3,
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `${Colors.SEPIA3}${HEX_TRANSPARENCY[15]}`,
                color: Colors.SEPIA2,
            },
            regular: {
                backgroundColor: Colors.SEPIA3,
                color: Colors.WHITE,
            },
        },
    ],
    assist: [
        {
            minimal: {
                backgroundColor: `#332288${HEX_TRANSPARENCY[15]}`,
                color: "#332288",
            },
            regular: {
                backgroundColor: "#332288",
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `#88ccee${HEX_TRANSPARENCY[15]}`,
                color: "#88ccee",
            },
            regular: {
                backgroundColor: "#88ccee",
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `#44aa99${HEX_TRANSPARENCY[15]}`,
                color: "#44aa99",
            },
            regular: {
                backgroundColor: "#44aa99",
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `#117733${HEX_TRANSPARENCY[15]}`,
                color: "#117733",
            },
            regular: {
                backgroundColor: "#117733",
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `#999933${HEX_TRANSPARENCY[15]}`,
                color: "#999933",
            },
            regular: {
                backgroundColor: "#999933",
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `#ddcc77${HEX_TRANSPARENCY[15]}`,
                color: "#ddcc77",
            },
            regular: {
                backgroundColor: "#ddcc77",
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `#cc6677${HEX_TRANSPARENCY[15]}`,
                color: "#cc6677",
            },
            regular: {
                backgroundColor: "#cc6677",
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `#882255${HEX_TRANSPARENCY[15]}`,
                color: "#882255",
            },
            regular: {
                backgroundColor: "#882255",
                color: Colors.WHITE,
            },
        },
        {
            minimal: {
                backgroundColor: `#aa4499${HEX_TRANSPARENCY[15]}`,
                color: "#aa4499",
            },
            regular: {
                backgroundColor: "#aa4499",
                color: Colors.WHITE,
            },
        },
    ],
};
export const MODE_LOOKUP_CODE = {
    annotating: "annotation",
    reconciling: "reconciliation",
    verifying: "verification",
    "verifying-readonly": "verification-readonly",
};
export const SUBMISSION_STATE_ICON = {
    success: {
        icon: faCircleCheck,
        style: { color: GREEN_CHECK_COLOR, opacity: 0.75 },
    },
    error: {
        icon: faTriangleExclamation,
        style: { color: Colors.RED3, opacity: 0.75 },
    },
    verified: {
        icon: faBadgeCheck,
        style: { color: Colors.ORANGE3, opacity: 0.75 },
    },
};
export const python_error_toast = ({ code, message, error }) =>
    actionToaster.show(
        createToast({
            intent: Intent.DANGER,
            action: {
                text: "Copy Code",
                icon: faIcon({ icon: faPython }),
                onClick: () => copy(code),
            },
            message: (
                <div>
                    {message}
                    <br />
                    {error}
                </div>
            ),
        })
    );
export const notebook_call = function (code, kernel_id) {
    const python_code = [
        "from meganno_client import Service as LabelerService; ",
        "from meganno_client.subset import Subset as LabelerSubset; ",
        `import json; print(json.dumps(${code})); `,
    ].join("");
    if (!_.isEqual(typeof Jupyter, "undefined")) {
        // jupyter notebook
        return new Promise((resolve, reject) => {
            var callbacks = {
                iopub: {
                    output: (data) => {
                        try {
                            resolve(data.content.text.trim());
                        } catch (error) {
                            reject(
                                `${_.get(data.content, "ename", "")}: ${_.get(
                                    data.content,
                                    "evalue",
                                    ""
                                )}`
                            );
                        }
                    },
                },
            };
            Jupyter.notebook.kernel.execute(python_code, callbacks);
        });
    } else if (
        !_.isEqual(typeof google, "undefined") &&
        _.isFunction(google.colab.kernel.invokeFunction)
    ) {
        return new Promise((resolve, reject) => {
            (async function () {
                try {
                    const result = await google.colab.kernel.invokeFunction(
                        "notebook.labeler_colab_callback", // The callback name.
                        [python_code], // The arguments.
                        {} // kwargs
                    );
                    const data = _.get(result, "data.application/json", "");
                    resolve(JSON.stringify(data));
                } catch (error) {
                    reject(error.message);
                }
            })();
        });
    } else {
        // jupyter lab
        return new Promise((resolve, reject) => {
            SessionAPI.listRunning().then((sessionModels) => {
                var sessionModel = null;
                for (let i = 0; i < sessionModels.length; i++) {
                    if (
                        _.isEqual(
                            kernel_id,
                            _.get(sessionModels[i], "kernel.id")
                        )
                    ) {
                        sessionModel = sessionModels[i];
                        break;
                    }
                }
                if (_.isNil(sessionModel))
                    reject("Can't locate JupyterLab session.");
                else {
                    const kernelManager = new KernelManager();
                    const kernel = kernelManager.connectTo({
                        model: sessionModel.kernel,
                    });
                    (async () => {
                        const future = kernel.requestExecute({
                            code: python_code,
                        });
                        future.onIOPub = (msg) => {
                            if (_.isEqual(msg.msg_type, "stream")) {
                                resolve(_.get(msg, "content.text").trim());
                            } else if (_.isEqual(msg.msg_type, "error")) {
                                reject(
                                    `${_.get(msg.content, "ename")}: ${_.get(
                                        msg.content,
                                        "evalue"
                                    )}`
                                );
                            }
                        };
                        await future.done;
                        kernelManager.dispose();
                    })();
                }
            });
        });
    }
};
