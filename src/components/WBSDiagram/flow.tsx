import type { NodeTypes} from "reactflow";
import { Background, Controls, ReactFlow } from "reactflow";

import { useWBSState } from "./context";
import { TaskNode } from "./TaskNode";



const NODE_TYPES: NodeTypes = {
    task: TaskNode
};

export function WBSFlow() {
    const { nodes, edges } = useWBSState();

    return (
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={NODE_TYPES}>
            <Background/>
            <Controls/>
        </ReactFlow>
    );
}
