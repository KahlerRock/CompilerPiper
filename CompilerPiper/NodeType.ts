
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
}
