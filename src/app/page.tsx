import type { WBSNode } from "@/components/WBSDiagram";
import { WBSDiagram } from "@/components/WBSDiagram";



export default function Home() {
    const wbsNodes: WBSNode[] = [
        { id: "Root",  label: "Project" },
        { id: "1",     label: "1", parentId: "Root" },
        { id: "2",     label: "2", parentId: "Root" },
        { id: "3",     label: "3", parentId: "Root" },
        { id: "1.1",   label: "1.1", parentId: "1" },
        { id: "1.2",   label: "1.2", parentId: "1" },
        { id: "1.2.1", label: "1.2.1", parentId: "1.2" },
    ];

    return (
        <section style={{ width: "800px", height: "600px", border: "1px solid black" }}>
            <WBSDiagram
                wbsNodes={wbsNodes}
            />
        </section>
    );
}
