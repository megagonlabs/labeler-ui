export const mergeUpdateLabelSchema = (updates, original) => {
    const updateKeys = Object.keys(updates);
    var newOriginal = { ...original };
    for (let i = 0; i < updateKeys.length; i++) {
        const currentKey = updateKeys[i];
        newOriginal[currentKey] = updates[currentKey];
    }
    return newOriginal;
};
