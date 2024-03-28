import _ from "lodash";
export const span_reconciliation_map = ({ label, recon_map, annotator }) => {
    const PATH = [label.label_name, "+" + label.start_idx, "+" + label.end_idx];
    let next_recon_map = _.cloneDeep(recon_map);
    let spans = _.get(next_recon_map, PATH, {});
    // spans: {label_value_1: {annotator_1, annotator_2, ...}, ...}
    const labels = _.get(label, "label_value", []);
    for (let i = 0; i < labels.length; i++) {
        let annotators = _.get(spans, labels[i], new Set());
        annotators.add(annotator);
        _.set(spans, labels[i], annotators);
    }
    _.set(next_recon_map, PATH, spans);
    return next_recon_map;
};
export const span_map_to_array = (recon_map) => {
    const label_names = Object.keys(recon_map);
    for (let i = 0; i < label_names.length; i++) {
        let result = [];
        const value = recon_map[label_names[i]];
        const start_indexes = Object.keys(value);
        for (let j = 0; j < start_indexes.length; j++) {
            const end_indexes = Object.keys(value[start_indexes[j]]);
            for (let k = 0; k < end_indexes.length; k++) {
                result.push({
                    start_idx: Number(start_indexes[j]),
                    end_idx: Number(end_indexes[k]),
                    labels: _.get(
                        recon_map,
                        [label_names[i], start_indexes[j], end_indexes[k]],
                        {}
                    ),
                });
            }
        }
        _.set(
            recon_map,
            [label_names[i], "reconciliation_label_spans"],
            result.sort((left, right) => {
                if (left.start_idx == right.start_idx)
                    return left.end_idx - right.end_idx;
                return left.start_idx - right.start_idx;
            })
        );
    }
    return recon_map;
};
