import { useCallback, useMemo } from "react";
import { Handle, Position, type NodeProps, NodeToolbar } from "reactflow";

import { useWBSActions } from "./context";
import type { WBSNode } from "./types";



export function TaskNode({
    data,
    selected
}: NodeProps<WBSNode>) {
    const { addNode } = useWBSActions();

    const onAddNode = useCallback(() => {
        addNode(data.id);
    }, [addNode, data.id]);

    const cardBaseClasses = "card bg-white !h-full";
    const cardClasses = useMemo(() => selected ? cardBaseClasses + " border-black" : cardBaseClasses, [selected]);

    return <>
        <div className={cardClasses}>
            <div className="card-body py-1">
                <p className="card-text text-base">
                    {data.label}
                </p>
            </div>
            {/* <div className="card-footer p-0">
                <button type="button" className="btn btn-sm w-full p-0">
                    <i className="bi bi-plus"></i>
                </button>
            </div> */}
        </div>
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom}/>
        <NodeToolbar isVisible={selected} position={Position.Bottom} offset={4}>
            <button className="btn btn-sm bg-white border-1 border-black" onClick={onAddNode}>
                <i className="bi bi-plus"></i>
            </button>
        </NodeToolbar>
    </>;
}
