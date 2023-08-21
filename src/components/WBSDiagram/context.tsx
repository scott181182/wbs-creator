import type { Context, Reducer} from "react";
import { createContext, useContext, useMemo, useReducer } from "react";
import type { Connection, Edge, Node, OnConnect } from "reactflow";
import { v4 as uuid4 } from "uuid";

import { relayoutGraph, wbs2graph } from "./layouts";
import type { WBSNode } from "./types";
import type { LayoutBaseProps } from "@/utils";



export interface WBSState {
    nodes: Node<WBSNode>[];
    edges: Edge[];
}
export interface WBSActions {
    addNode: (parentId: string) => void;
    deleteNode: (nodeId: string) => void;
    // onNodesChange: OnNodesChange,
    // onEdgesChange: OnEdgesChange,
    onConnect: OnConnect;
}

type WBSPayload =
    { type: "addNode", parentId: string } |
    { type: "deleteNode", nodeId: string } |
    { type: "onConnect", connection: Connection };

export interface WBSContextProps extends LayoutBaseProps {
    initialValue: WBSNode[];
}

const WBSStateContext = createContext<WBSState | undefined>(undefined);
const WBSActionContext = createContext<WBSActions | undefined>(undefined);

export function WBSContext({
    initialValue,
    children
}: WBSContextProps) {
    const { nodes, edges } = useMemo(() => wbs2graph(initialValue), [initialValue]);

    const [value, dispatch] = useReducer<Reducer<WBSState, WBSPayload>>((state, action) => {
        switch(action.type) {
            case "addNode": {
                const id = uuid4();
                const newNode: Node<WBSNode> = {
                    id,
                    type: "task",
                    data: {
                        id,
                        label: "New Node",
                        parentId: action.parentId
                    },
                    // Temporary position, since we're about to re-layout the graph.
                    position: { x: 0, y: 0 }
                };
                const newEdge: Edge = {
                    source: action.parentId,
                    target: id,
                    id: `${action.parentId}->${id}`
                };
                return relayoutGraph([ ...state.nodes, newNode ], [ ...state.edges, newEdge ]);
            }
            case "deleteNode": {
                return state;
            }
            case "onConnect": {
                return state;
            }
        }
    }, { nodes, edges });

    const actionValue = useMemo<WBSActions>(() => ({
        addNode: (parentId) => dispatch({ type: "addNode", parentId }),
        deleteNode: (nodeId) => dispatch({ type: "deleteNode", nodeId }),
        onConnect: (connection) => dispatch({ type: "onConnect", connection })
    }), []);

    return <WBSStateContext.Provider value={value}>
        <WBSActionContext.Provider value={actionValue}>
            {children}
        </WBSActionContext.Provider>
    </WBSStateContext.Provider>;
}

export function useWBSState() {
    return useContext(WBSStateContext as Context<WBSState>);
}
export function useWBSActions() {
    return useContext(WBSActionContext as Context<WBSActions>);
}
