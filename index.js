

/**
 * @typedef {{ title: string, depth: number, children: WBSNode[], getWidth: () => number }} WBSNode
 */

const NODE_WIDTH = 100;
const NODE_HEIGHT = 40;

const SIBLING_GAP = 10;
const CHILD_GAP = 40;



/**
 * 
 * @param {WBSNode} node 
 */
function getNodeWidth(node) {
    return node.children.length === 0 ?
        NODE_WIDTH :
        node.children.reduce((acc, val) => acc + val.getWidth() + SIBLING_GAP, -SIBLING_GAP);
}

/**
 * 
 * @param {WBSNode} [parent] 
 * @param {string} [title]
 * @return {WBSNode}
 */
function makeNode(parent, title) {
    if(!parent) {
        // Root Node
        return {
            title: title ?? "Root",
            depth: 0,
            children: [],
            getWidth() { return getNodeWidth(this); }
        }
    } else {
        const node = {
            title: title ?? "New Node",
            depth: parent.depth + 1,
            children: [],
            getWidth() { return getNodeWidth(this); }
        }
        parent.children.push(node);
        return node;
    }
}


/** @type {WBSNode} */
const tree = makeNode();
const c1 = makeNode(tree, "1");
makeNode(c1, "1.1");
const c12 = makeNode(c1, "1.2");
makeNode(c12, "1.2.1");
makeNode(tree, "2");
makeNode(tree, "3");



/**
 * @param {WBSNode} root 
 */
function renderTree(root) {
    /** @type d3.Selection<SVGElement, any, HTMLElement, any> */
    const svg = d3.select("#wbs-svg");
    
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;
    svg.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", width)
        .attr("height", height);

    let maing = svg.selectChild("g.main");
    if(maing.empty()) {
        // Enable panning and zooming
        const zoom = d3.zoom()
            .on("zoom", function(e) { maing.attr("transform", e.transform); });
        svg.call(zoom);

        // Initialize root tree context
        maing = svg.append("g").attr("class", "main");

        const initX = (width - NODE_WIDTH) / 2;
        const initY = height / 2 - NODE_HEIGHT;
        maing.append("g")
            .attr("class", "wbs-subtree")
            .attr("transform", `translate(${initX} ${initY})`);
    }

    renderSubTree(root, maing.selectChild("g.wbs-subtree"));
}

const EDGE_RADIUS = 10;
function getEdgePath(startX, startY, endX, endY) {
    const edge = d3.path();
    edge.moveTo(startX, startY);
    const middle = startY + CHILD_GAP / 2;

    if(startX === endX) {
        // Straight line down to child!
        edge.lineTo(endX, endY);
    } else if(Math.abs(startX - endX) < EDGE_RADIUS * 2) {
        // Barely offset from child, just a smooth bezier curve.
        edge.lineTo(startX, middle - EDGE_RADIUS);
        edge.bezierCurveTo(startX, middle, endX, middle, endX, middle + EDGE_RADIUS);
        edge.lineTo(endX, endY);
    } else {
        // Some nice circular corners so overlapping lines don't get noisy.
        edge.lineTo(startX, middle - EDGE_RADIUS);
        edge.arcTo(startX, middle, startX - Math.sign(startX - endX) * EDGE_RADIUS, middle, EDGE_RADIUS);
        edge.lineTo(endX + Math.sign(startX - endX) * EDGE_RADIUS, middle);
        edge.arcTo(endX, middle, endX, middle + CHILD_GAP, EDGE_RADIUS);
        edge.lineTo(endX, endY);
    }

    return edge.toString();
}
/**
 * 
 * @param {WBSNode} root 
 * @param {d3.Selection<SVGGElement, any, HTMLElement, any>} ctx 
 */
function renderSubTree(root, ctx) {
    const edgeStartX = NODE_WIDTH / 2;
    const edgeStartY = NODE_HEIGHT;

    const childrenWidth = root.getWidth();
    let childStartX = (NODE_WIDTH - childrenWidth) / 2;
    const childStartY = NODE_HEIGHT + CHILD_GAP;

    ctx.selectChildren(".wbs-edge").data(root.children).join("path")
        .attr("class", "wbs-edge")
        .attr("stroke", "#f87")
        .attr("stroke-width", "2")
        .attr("fill", "none")
        .attr("d", (child, i) => {
            const childWidth = child.getWidth();
            const childX = childStartX + (childWidth - NODE_WIDTH) / 2;
            const edgeEndX = childX + NODE_WIDTH / 2;
            childStartX += childWidth + SIBLING_GAP;

            return getEdgePath(edgeStartX, edgeStartY, edgeEndX, childStartY)
        });
    childStartX = (NODE_WIDTH - childrenWidth) / 2;
    ctx.selectChildren(".wbs-subtree").data(root.children).join("g")
        .attr("class", "wbs-subtree")
        .attr("transform", (child) => {
            const childWidth = child.getWidth();
            const childX = childStartX + (childWidth - NODE_WIDTH) / 2;
            childStartX += childWidth + SIBLING_GAP;

            return `translate(${childX} ${childStartY})`;
        })
        .each(function (child) {
            const childg = d3.select(this);
            renderSubTree(child, childg);
        })

    ctx.selectChildren("wbs-node").data([ root ]).join("g")
        .attr("class", "wbs-node")
        .call(renderNode)
}

/**
 * @param {d3.Selection<SVGGElement, WBSNode, HTMLElement, any>} ctx 
 */
function renderNode(ctx) {
    const nodeg = ctx.append("g")
        .on("mouseover", () => {
            rect.transition()
                .duration(250)
                .attr("fill", "#ddd")
        })
        .on("mouseout", () => {
            rect.transition()
                .duration(250)
                .attr("fill", "#fff")
        })
        .on("click", (_ev, node) => {
            makeNode(node);
            renderTree(tree);
        });
    const rect = nodeg.append("rect")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", NODE_WIDTH)
        .attr("height", NODE_HEIGHT)
        .attr("rx", 10)
        .attr("stroke", "#000")
        .attr("fill", "#fff")
    const text = nodeg.append("text")
        .attr("x", NODE_WIDTH / 2)
        .attr("y", NODE_HEIGHT / 2)
        .attr("text-anchor", "middle")
        .text((node) => node.title);
}

renderTree(tree);