module.exports = {
    rules: {
        // suppress errors for missing 'import React' in files
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "react/no-render-return-value": "warn",
        "no-unused-vars": "warn",
        "react/jsx-key": "warn",
    },
    globals: { Jupyter: "readonly", google: "readonly" },
    env: {
        jest: true,
        es6: true,
        browser: true,
    },
    extends: ["eslint:recommended", "plugin:react/recommended"],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        parser: "babel-eslint",
    },
    settings: {
        react: {
            version: "detect",
        },
    },
};
