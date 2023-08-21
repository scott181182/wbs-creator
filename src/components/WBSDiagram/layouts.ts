import { graphlib, layout as dagreLayout } from "@dagrejs/dagre";
import type { Edge, Node } from "reactflow";

import type { WBSNode } from "./types";



const MIN_NODE_WIDTH = 100;
const MIN_NODE_HEIGHT = 40;
const SIBLING_GAP = 10;
const CHILD_GAP = 50;



type LinkedWBSNode = WBSNode & { parent?: LinkedWBSNode, children?: LinkedWBSNode[] };



function wbs2tree(wbsNodes: WBSNode[]): LinkedWBSNode {
    const nodeMap: Record<string, LinkedWBSNode> = {};
    const edgeMap: Record<string, string[]> = {};

    let rootId: string | undefined;
    for(const node of wbsNodes) {
        nodeMap[node.id] = node;

        if(node.parentId) {
            if(!(node.parentId in edgeMap)) {
                edgeMap[node.parentId] = [ node.id ];
            } else {
                edgeMap[node.parentId].push(node.id);
            }
        } else {
            rootId = node.id;
        }
    }

    for(const node of wbsNodes) {
        if(node.parentId) {
            nodeMap[node.id].parent = nodeMap[node.parentId];
        }
        if(node.id in edgeMap) {
            nodeMap[node.id].children = edgeMap[node.id].map((childId) => nodeMap[childId]);
        }
    }

    if(!rootId) {
        throw new Error("Could not find root node");
    }

    return nodeMap[rootId];
}
function getNodeChildrenWidth(node: LinkedWBSNode): number {
    return node.children && node.children.length > 0 ?
        node.children.reduce((acc, val) => acc + getNodeChildrenWidth(val) + SIBLING_GAP, -SIBLING_GAP) :
        MIN_NODE_WIDTH;
}
function expandSubtrees(node: Node<LinkedWBSNode>, nodes: Node<LinkedWBSNode>[], edges: Edge[]) {
    const parentPosition = node.position;

    const childrenWidth = getNodeChildrenWidth(node.data);
    let childStartX = parentPosition.x + (MIN_NODE_WIDTH - childrenWidth) / 2;
    console.log(`${node.id} - ${childrenWidth} - ${childStartX}`);
    const childStartY = parentPosition.y + MIN_NODE_HEIGHT + CHILD_GAP;

    const childCount = node.data.children?.length ?? 0;
    for(let i = 0; i < childCount; i++) {
        const child = node.data.children![i];

        edges.push({
            id: `${node.id}->${child.id}`,
            source: node.id,
            target: child.id,
            type: "smoothstep"
        });

        const childWidth = getNodeChildrenWidth(child);
        const childNode: Node<LinkedWBSNode> = {
            data: child,
            id: child.id,
            position: {
                x: childStartX + (childWidth - MIN_NODE_WIDTH) / 2,
                y: childStartY
            },
            style: {
                width: `${MIN_NODE_WIDTH}px`,
                height: `${MIN_NODE_HEIGHT}px`
            }
        };
        childStartX += childWidth + SIBLING_GAP;
        nodes.push(childNode);
        expandSubtrees(childNode, nodes, edges);
    }
}



/**
 * Uses a custom algorithm for layout out the tree.
 *
 * @param wbsNodes
 * @returns
 */
export function wbs2reactflow(wbsNodes: WBSNode[]): { nodes: Node<WBSNode>[], edges: Edge[] } {
    const wbsRoot = wbs2tree(wbsNodes);

    const nodes: Node<WBSNode>[] = [
        {
            id: "root",
            data: wbsRoot,
            type: "input",
            position: { x: 0, y: 0 }
        }
    ];
    const edges: Edge[] = [];

    expandSubtrees(nodes[0], nodes, edges);

    return { nodes, edges };
}



/**
 * Uses the `dagre` library for laying out the tree.
 *
 * @param wbsNodes
 * @returns
 */
export function wbs2graph(wbsNodes: WBSNode[]): { nodes: Node<WBSNode>[], edges: Edge[] } {
    const g = new graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({
        rankdir: "TB",
        nodesep: SIBLING_GAP,
        ranksep: CHILD_GAP,
    });

    for(const node of wbsNodes) {
        g.setNode(node.id, {
            ...node,
            width: MIN_NODE_WIDTH,
            height: MIN_NODE_HEIGHT
        });

        if(node.parentId) { g.setEdge(node.parentId, node.id); }
    }

    dagreLayout(g);

    return {
        nodes: wbsNodes.map((n) => {
            const { x, y, width, height } = g.node(n.id);

            return {
                id: n.id,
                data: n,
                type: "task",
                position: { x, y },
                style: { width, height }
            };
        }),
        edges: g.edges().map((ge) => ({
            source: ge.v,
            target: ge.w,
            id: `${ge.v}->${ge.w}`,
            type: "smoothstep"
        }))
        // edges: []
    };
}

/**
 * Uses the `dagre` library to re-layout out an existing graph.
 */
export function relayoutGraph(nodes: Node<WBSNode>[], edges: Edge[]): { nodes: Node<WBSNode>[], edges: Edge[] } {
    const g = new graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({
        rankdir: "TB",
        nodesep: SIBLING_GAP,
        ranksep: CHILD_GAP,
    });

    for(const node of nodes) {
        g.setNode(node.id, {
            ...node,
            width: MIN_NODE_WIDTH,
            height: MIN_NODE_HEIGHT
        });
    }
    for(const edge of edges) {
        g.setEdge(edge.source, edge.target);
    }

    dagreLayout(g);

    return {
        nodes: nodes.map((n) => {
            const { x, y, width, height } = g.node(n.id);

            return {
                ...n,
                position: { x, y },
                style: { width, height }
            };
        }),
        edges: g.edges().map((ge) => ({
            source: ge.v,
            target: ge.w,
            id: `${ge.v}->${ge.w}`,
            type: "smoothstep"
        }))
    };
}

