import commonjs from '@rollup/plugin-commonjs';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';



export default {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'iife'
    },
    plugins: [
        commonjs(),
        injectProcessEnv({
            NODE_ENV: "development"
        }),
        nodeResolve(),
        typescript()
    ]
};
