"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls } from "reactflow";

import "reactflow/dist/style.css";
import { wbs2graph } from "./layouts";
import type { WBSNode } from "./types";



export type { WBSNode } from "./types";

// const BUTTON_SIZE = 16;



export interface WBSDiagramProps {
    wbsNodes: WBSNode[];
}

export function WBSDiagram({
    wbsNodes
}: WBSDiagramProps) {
    const { nodes, edges } = useMemo(() => wbs2graph(wbsNodes), [wbsNodes]);

    return <div className="w-full h-full">
        <ReactFlow nodes={nodes} edges={edges}>
            <Background/>
            <Controls/>
        </ReactFlow>
    </div>;
}
