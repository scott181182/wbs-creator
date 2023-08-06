import * as go from "gojs";
import { createApp } from "vue/dist/vue.esm-bundler.js";

import { WBSDiagram } from "./WBSDiagram";


createApp({
    components: {
        WBSDiagram
    },
    data: () => ({
        model: new go.TreeModel([
            { key: "Root", color: "white" },
            { key: "1", parent: "Root" },
            { key: "2", parent: "Root" },
            { key: "3", parent: "Root" },
            { key: "1.1", parent: "1" },
            { key: "1.2", parent: "1" },
            { key: "1.2.1", parent: "1.2" },
        ])
    }),
    mounted() {
        console.log("Mounted!")
    },
}).mount("#main");


interface WBSNode {
    title: string,
    depth: number,
    children: WBSNode[],
    getWidth: () => number
}
