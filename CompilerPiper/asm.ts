import { TreeNode } from './NodeType';

let asmCode: string[] = [];
let labelCounter = 0;

enum VarType {
    STRING,
    FLOAT,
    INT
}

function programNodeCode(n: TreeNode) {
    //console.log("program");
    if (n.sym != "program") {
        ////console.log("pnc");
        ICE();
    }

    braceblockNodeCode(n.children[0]);
}

function braceblockNodeCode(n: TreeNode) {
    //console.log("brace");
    stmtsNodeCode(n.children[1]);
}

function stmtsNodeCode(n: TreeNode) {
    //console.log("stmts");
    if (n.children.length == 0) {
        return;
    }
    stmtNodeCode(n.children[0]);
    stmtsNodeCode(n.children[1]);
}

function stmtNodeCode(n: TreeNode) {
    //console.log("stmt");
    let c = n.children[0];
    ////console.log(c.sym);
    switch (c.sym) {
        case "cond":
            condNodeCode(c); break;
        case "loop":
            loopNodeCode(c); break;
        case "returnStmt":
            returnstmtNodeCode(c); break;
        default:
            ////console.log("snc");
            ICE();
    }
}

function returnstmtNodeCode(n: TreeNode) {
    //console.log("returnstmt");
    //console.log(n);
    exprNodeCode(n.children[1]);
    emit("pop rax");
    emit("ret");
}

function exprNodeCode(n: TreeNode): VarType {
    //console.log("expr");
    //console.log(n);
    return orexpNodeCode(n.children[0]);
}

function andexpNodeCode(n: TreeNode): VarType {
    //console.log("andexp");
    //console.log(n);
    if (n.children.length == 1) {
        return notexpNodeCode(n.children[0]);
    } else {
        let andTerm = andexpNodeCode(n.children[0]);
        convertStackTopToZeroOrOneInteger(andTerm);
        let lbl = label();
        emit("cmp qword [rsp], 0");
        emit(`je ${lbl}`);
        emit('add rsp, 8');
        let notTerm = notexpNodeCode(n.children[2]);
        ////console.log("notTerm: " + notTerm);
        convertStackTopToZeroOrOneInteger(notTerm);
        emit(`${lbl}:`);
        return VarType.INT;
    }

}

function notexpNodeCode(n: TreeNode): VarType {
    //console.log("notexp");
    //console.log(n);
    if (n.children.length == 1) {
        return relexpNodeCode(n.children[0]);
    } else {
        let notTerm = notexpNodeCode(n.children[1]);
        convertStackTopToZeroOrOneInteger(notTerm);
        emit("pop rbx");
        emit("mov qword rax, 1");
        emit("sub rax, rbx");
        emit("push rax");
        return notTerm;
    }
}

function termNodeCode(n: TreeNode): VarType {
    //console.log("term");
    if (n.children.length == 1) {
        return negNodeCode(n.children[0]);
    } else {
        let termType = termNodeCode(n.children[0]);
        let negType = negNodeCode(n.children[2]);

        if (isSameType(termType, negType)) {
            emit("pop rbx");
            emit("pop rax");
            if (termType == VarType.INT) {
                let c = n.children[1].token.lexeme;
                //console.log(c);
                switch (c) {
                    case "*":
                        emit("imul rbx");
                        emit("push rax");
                        break;
                    case "/":
                        emit("mov qword rdx, 0");
                        emit("idiv rbx");
                        emit("push rax");
                        break;
                    case "%":
                        emit("mov qword rdx, 0");
                        emit("idiv rbx");
                        emit("push rdx");
                        break;
                    default:
                        throw new Error("WRONG SYMBOL");
                }
            }
            return termType;
        } else {
            throw Error();
        }
    }
}

function negNodeCode(n: TreeNode): VarType {
    //console.log("neg");
    if (n.children.length == 1) {
        ////console.log(n.children[0]);
        return factorNodeCode(n.children[0]);
    } else {
        let negType = negNodeCode(n.children[1]);
        if (negType == VarType.INT) {
            emit("pop rax");
            emit("mov qword rbx, 0");
            emit("sub rbx, rax");
            emit("push rbx");

            return negType;
        }
    }
}


function factorNodeCode(n: TreeNode): VarType {
    //console.log("factor");
    //console.log(n);
    let child = n.children[0];
    ////console.log(child);
    switch (child.sym) {
        case "NUM":
            let v = parseInt(child.token.lexeme, 10);
            emit(`push qword ${v}`);
            return VarType.INT;
        case "LP":
            return exprNodeCode(n.children[1]);
        default:
            ICE();
    }
}

function sumNodeCode(n: TreeNode): VarType {
    //console.log("sum");
    if (n.children.length == 1) {
        return termNodeCode(n.children[0]);
    } else {
        let sumType = sumNodeCode(n.children[0]);
        let termType = termNodeCode(n.children[2]);

        if (!isSameType(sumType, termType)) {
            throw new Error();
        } else {
            let reg1, reg2: string;

            if (sumType == VarType.INT) {
                reg1 = "rax";
                reg2 = "rbx";
            } else {
                reg1 = "xmm0";
                reg2 = "xmm1";
            }

            emit(`pop ${reg2}`);
            emit(`pop ${reg1}`);

            switch (n.children[1].sym) {
                case "PLUS":
                    emit(`add ${reg1}, ${reg2}`);
                    break;
                case "MINUS":
                    emit(`sub ${reg1}, ${reg2}`);
                    break;
                default:
                    ICE();
            }

            emit(`push ${reg1}`);
            return sumType;
        }
    }
}

function relexpNodeCode(n: TreeNode): VarType {
    //console.log("relexp");
    //console.log(n);
    if (n.children.length == 1) {
        return sumNodeCode(n.children[0]);
    } else {
        let sum1Type = sumNodeCode(n.children[0]);
        let sum2Type = sumNodeCode(n.children[2]);
        //console.log("sum1Type", sum1Type, "sum2Type", sum2Type);
        if (isSameType(sum1Type, sum2Type)) {
            let reg: string;

            if (sum1Type == VarType.INT) {
                reg = "rax";
            }

            emit(`pop ${reg}`);
            emit(`cmp [rsp], ${reg}`);

            //console.log(n.children[1].token.lexeme);
            switch (n.children[1].token.lexeme) {
                case ">=": emit("setge al"); break;
                case "<=": emit("setle al"); break;
                case ">": emit("setg al"); break;
                case "<": emit("setl al"); break;
                case "==": emit("sete al"); break;
                case "!=": emit("setne al"); break;
                default: ICE();
            }

            emit(`movzx qword ${reg}, al`);
            emit(`mov [rsp], ${reg}`);

            return sum1Type;
        }
    }
}

function convertStackTopToZeroOrOneInteger(type: VarType) {
    //console.log("convert");
    let reg: string;
    ////console.log(type);
    if (type != VarType.INT && type != VarType.FLOAT) {
        throw new Error("INCORRECT VARTYPE");
    }

    if (type == VarType.INT) {
        reg = "rax";
    } else {
        reg = "xmm0";
    }
    emit("cmp qword [rsp], 0");
    emit("setne al");
    emit(`movzx ${reg}, al`);
    emit(`mov [rsp], ${reg}`);
}

function orexpNodeCode(n: TreeNode): VarType {
    //console.log("orexp");
    //console.log(n);
    if (n.children.length == 1) {
        return andexpNodeCode(n.children[0]);
    } else {
        let orexpType = orexpNodeCode(n.children[0]);
        convertStackTopToZeroOrOneInteger(orexpType);
        let lbl = label();
        emit("cmp qword [rsp], 0");
        emit(`jne ${lbl}`);
        emit("add rsp, 8");
        let andexpType = andexpNodeCode(n.children[2]);
        ////console.log("andexpType" + andexpType);
        convertStackTopToZeroOrOneInteger(andexpType);
        emit(`${lbl}:`);

        return VarType.INT;
    }
}



function condNodeCode(n: TreeNode) {
    //console.log("cond");
    //console.log(n);
    if (n.children.length == 5) {
        exprNodeCode(n.children[2]);
        emit("pop rax");
        emit('cmp rax, 0');
        var endifLabel = label();   
        emit(`je ${endifLabel}`);       //rax == 0 -> jump to endifLabel
        braceblockNodeCode(n.children[4]);
        emit(`${endifLabel}:`);         //endifLabel
    } else {
        exprNodeCode(n.children[2]);
        emit("pop rax");
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
    //console.log("loop");
    //console.log(n);
    var startLoopLabel = label();
    var endLoopLabel = label();
    emit(`${startLoopLabel}:`);     //startLoopLabel
    exprNodeCode(n.children[2]);
    emit("pop rax");
    emit('cmp rax, 0');
    emit(`je ${endLoopLabel}`);     //rax == 0 -> jump to endLoopLabel
    braceblockNodeCode(n.children[4]);
    emit(`jmp ${startLoopLabel}`);  //jump to startLoopLabel
    emit(`${endLoopLabel}:`);       //endLoopLabel
}

export function makeAsm(root: TreeNode) {
    //console.log("asm");
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

function isNumeric(n: number) {
    if (n == VarType.FLOAT || n == VarType.INT) {
        return true;
    }

    return false;
}

function isSameType(a: VarType, b: VarType): boolean {
    if (a == b) {
        return true;
    }

    return false;
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