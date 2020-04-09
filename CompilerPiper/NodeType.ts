
import { Token } from "./Token";

export class NodeType {
    label: string;
    n: NodeType[];

    constructor(L: string) {
        this.label = L;
        this.n = [];
    }
}

export class TreeNode {
    sym: string;
    token: Token;
    children: TreeNode[];
    operandStack: TreeNode[];
    operatorStack: TreeNode[];

    constructor(sym: string, token: Token) {
        this.sym = sym;
        this.token = token;
        this.children = [];
    }

    addChild(input: TreeNode) {
        this.children.push(input);
    }

    toString() {
        function walk(n: any, callback: any) {
            callback(n);
            n.children.forEach((x: any) => {
                walk(x, callback);
            });
        }
        let L: string[] = [];
        L.push("digraph d{");
        L.push(`node [fontname="Helvetica",shape=box];`);
        let counter = 0;
        walk(this, (n: any) => {
            n.NUMBER = "n" + (counter++);
            let tmp = n.sym;
            if (n.token) {
                tmp += "\n";
                tmp += n.token.lexeme;
            }
            tmp = tmp.replace(/&/g, "&amp;");
            tmp = tmp.replace(/</g, "&lt;");
            tmp = tmp.replace(/>/g, "&gt;");
            tmp = tmp.replace(/\n/g, "<br/>");

            L.push(`${n.NUMBER} [label=<${tmp}>];`);
        });
        walk(this, (n: any) => {
            n.children.forEach((x: any) => {
                L.push(`${n.NUMBER} -> ${x.NUMBER};`);
            });
        });
        L.push("}");
        return L.join("\n");
    }
}
