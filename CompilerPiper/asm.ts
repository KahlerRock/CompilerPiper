import { TreeNode } from './NodeType';

let asmCode: string[] = [];
let labelCounter = 0;

function programNodeCode(n: TreeNode) {
    if (n.sym != "program") {
        //console.log("pnc");
        ICE();
    }

    braceblockNodeCode(n.children[0]);
}

function braceblockNodeCode(n: TreeNode) {
    stmtsNodeCode(n.children[1]);
}

function stmtsNodeCode(n: TreeNode) {
    if (n.children.length == 0) {
        return;
    }
    stmtNodeCode(n.children[0]);
    stmtsNodeCode(n.children[1]);
}

function stmtNodeCode(n: TreeNode) {
    let c = n.children[0];
    //console.log(c.sym);
    switch (c.sym) {
        case "cond":
            condNodeCode(c); break;
        case "loop":
            loopNodeCode(c); break;
        case "returnStmt":
            returnstmtNodeCode(c); break;
        default:
            //console.log("snc");
            ICE();
    }
}

function returnstmtNodeCode(n: TreeNode) {
    exprNodeCode(n.children[1]);
    emit("ret");
}

function exprNodeCode(n: TreeNode) {
    let d = parseInt(n.children[0].token.lexeme, 10);
    emit(`mov rax, ${d}`);
}

function condNodeCode(n: TreeNode) {
    if (n.children.length == 5) {
        exprNodeCode(n.children[2]);
        emit('cmp rax, 0');
        var endifLabel = label();   
        emit(`je ${endifLabel}`);       //rax == 0 -> jump to endifLabel
        braceblockNodeCode(n.children[4]);
        emit(`${endifLabel}:`);         //endifLabel
    } else {
        exprNodeCode(n.children[2]);
        emit('cmp rax, 0');
        var startelseLabel = label();
        emit(`je ${startelseLabel}`);   //rax == 0 -> jump to startelseLabel
        braceblockNodeCode(n.children[4]);
        var endelseLabel = label();     //rax != 0 -> jump to endelseLabel
        emit(`jmp ${endelseLabel}`)     //jump to endelseLabel
        emit(`${startelseLabel}:`);     //startelseLabel
        braceblockNodeCode(n.children[6]);
        emit(`${endelseLabel}:`);       //endelseLabel
    }
}

function loopNodeCode(n: TreeNode) {
    var startLoopLabel = label();
    var endLoopLabel = label();
    emit(`${startLoopLabel}:`);     //startLoopLabel
    exprNodeCode(n.children[2]);
    emit('cmp rax, 0');
    emit(`je ${endLoopLabel}`);     //rax == 0 -> jump to endLoopLabel
    braceblockNodeCode(n.children[4]);
    emit(`jmp ${startLoopLabel}`);  //jump to startLoopLabel
    emit(`${endLoopLabel}:`);       //endLoopLabel
}

export function makeAsm(root: TreeNode) {
    asmCode = [];
    labelCounter = 0;
    emit("default rel");
    emit("section .text");
    emit("global main");
    emit("main:");
    programNodeCode(root);
    emit("ret");
    emit("section .data");
    return asmCode.join("\n");
}

function ICE() {
    throw new Error("Internal Compiler Error");
}

function emit(instr: string) {
    asmCode.push(instr);
}

function label() {
    let s = "lbl" + labelCounter;
    labelCounter++;
    return s;
}