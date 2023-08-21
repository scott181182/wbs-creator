"use client";

import "reactflow/dist/style.css";

import { WBSContext } from "./context";
import { WBSFlow } from "./flow";
import type { WBSNode } from "./types";



export type { WBSNode } from "./types";

// const BUTTON_SIZE = 16;



export interface WBSDiagramProps {
    initialValue: WBSNode[];
}

export function WBSDiagram({
    initialValue
}: WBSDiagramProps) {
    return <div className="w-full h-full">
        <WBSContext initialValue={initialValue}>
            <WBSFlow/>
        </WBSContext>
    </div>;
}
