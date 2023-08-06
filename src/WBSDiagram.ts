import * as go from "gojs";
import { defineComponent } from "vue/dist/vue.esm-bundler.js";



const MIN_NODE_WIDTH = 100;
const MIN_NODE_HEIGHT = 40;
const BUTTON_SIZE = 16;



export const WBSDiagram = defineComponent({
    name: "wbs-diagram",
    template: "<div></div>",  // just a plain DIV
    props: ["modelData"],  // accept model data as a parameter
    data: () => ({
        diagram: undefined as go.Diagram | undefined
    }),
    mounted() {
        this.diagram = new go.Diagram(this.$el, {
            layout: new go.TreeLayout({
                angle: 90,
                arrangement: go.TreeLayout.ArrangementHorizontal
            }),
            "undoManager.isEnabled": true,
            allowCopy: false,
            allowDelete: false,
            allowMove: false,
            // Model ChangedEvents get passed up to component users
            "ModelChanged": e => { this.$emit("model-changed", e); },
            "ChangedSelection": e => { this.$emit("changed-selection", e); }
        });

        this.diagram.nodeTemplate = new go.Node("Spot", {
            selectionObjectName: "body",
        })
            .bind("text", "name")
            .bind(new go.Binding("layerName", "isSelected", sel => sel ? "Foreground" : "").ofObject())
            .add(new go.Panel("Auto", { name: "body" })
                .add(new go.Shape("RoundedRectangle", {
                    fill: "#fff",
                    minSize: new go.Size(MIN_NODE_WIDTH, MIN_NODE_HEIGHT)
                }))
                .add(new go.TextBlock({ margin: 3, editable: true })
                    .bind(new go.Binding("text", "key").makeTwoWay())
                )
            )
            .add(go.GraphObject.make("Button",
                new go.Shape("PlusLine", { width: BUTTON_SIZE, height: BUTTON_SIZE }),
                {
                    name: "addButton",
                    alignment: go.Spot.BottomCenter,
                    click: (_ev, btn) => { this.addNode(btn.part); }
                },
            ));

        this.diagram.linkTemplate = new go.Link({
            routing: go.Link.Orthogonal,
            layerName: "background",
            corner: 5
        }).add(new go.Shape({
            strokeWidth: 2,
            stroke: "#f84"
        }));

        this.updateModel(this.modelData);
    },
    watch: {
        modelData: function(val) { this.updateModel(val); }
    },
    methods: {
        addNode(node: go.Part | null) {
            if (!node) return;
            const thisemp = node.data;
            this.diagram.startTransaction("add node");
            const newNodeData = { key: "(new node)", parent: thisemp.key };
            this.diagram.model.addNodeData(newNodeData);
            const newNode = this.diagram.findNodeForData(newNodeData);
            if (newNode) { newNode.location = node.location; }
            this.diagram.commitTransaction("add node");
        },
        model() { return this.diagram.model; },
        updateModel(val) {
            // No GoJS transaction permitted when replacing Diagram.model.
            if (val instanceof go.Model) {
                this.diagram.model = val;
            } else {
                var m = new go.TreeModel()
                if (val) {
                    for (var p in val) {
                        m[p] = val[p];
                    }
                }
                this.diagram.model = m;
            }
        },
        updateDiagramFromData() {
            this.diagram.startTransaction();
            // This is very general but very inefficient.
            // It would be better to modify the diagramData data by calling
            // Model.setDataProperty or Model.addNodeData, et al.
            this.diagram.updateAllRelationshipsFromData();
            this.diagram.updateAllTargetBindings();
            this.diagram.commitTransaction("updated");
        }
    }
});
