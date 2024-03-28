import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import injectProcessEnv from "rollup-plugin-inject-process-env";
const onwarn = (warning) => {
    const SKIP_CODES = ["THIS_IS_UNDEFINED", "CIRCULAR_DEPENDENCY"];
    if (SKIP_CODES.includes(warning.code)) return;
    console.error(`(!) ${warning.message}`);
};
const minify = process.argv[process.argv.length - 1] === "minify";
export default {
    input: "src/index.js",
    output: {
        file: `../meganno_ui/bundle${minify ? ".min" : ""}.js`,
        format: "esm",
        inlineDynamicImports: true,
    },
    onwarn,
    plugins: [
        nodeResolve({ browser: true }),
        json(),
        babel({
            babelHelpers: "bundled",
            exclude: "node_modules/**",
        }),
        commonjs(),
        injectProcessEnv({ NODE_ENV: JSON.stringify("production") }),
        minify ? terser({ compress: { drop_console: true } }) : null,
    ],
};
