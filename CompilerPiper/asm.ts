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
    let exprType = exprNodeCode(n.children[1]);
    if (exprType == VarType.INT) {
        emit("pop rax");
    } else if (exprType == VarType.FLOAT) {
        floatPop("xmm0");
        emit("cvtsd2si rax, xmm0");
    }
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
        //console.log(notTerm);
        convertStackTopToZeroOrOneInteger(notTerm);
        emit("pop rbx");
        emit("mov qword rax, 1");
        emit("sub rax, rbx");
        emit("push rax");
        return VarType.INT;
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
            if (termType == VarType.INT) {
                emit("pop rbx");
                emit("pop rax");
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
                return VarType.INT;

            } else if (termType == VarType.FLOAT) {
                floatPop("xmm1");
                floatPop("xmm0");
                let c = n.children[1].token.lexeme;
                switch (c) {
                    case "*":
                        emit("mulsd xmm0, xmm1");
                        floatPush("xmm0");
                        break;
                    case "/":
                        emit("divsd xmm0, xmm1");
                        floatPush("xmm0")
                        break;
                    default:
                        throw new Error("WRONG SYMBOL");
                }
                return VarType.FLOAT;
            }
        } else {
            throw Error();
        }
    }
}

function negNodeCode(n: TreeNode): VarType {
    //console.log("neg");
    if (n.children.length == 1) {
        //console.log(n.children[0]);
        return factorNodeCode(n.children[0]);
    } else {
        let negType = negNodeCode(n.children[1]);
        //console.log(negType);
        if (negType == VarType.INT) {
            emit("pop rax");
            emit("mov qword rbx, 0");
            emit("sub rbx, rax");
            emit("push rbx");

            return VarType.INT;
        } else if (negType == VarType.FLOAT) {
            emit("movq xmm0, [rsp]");
            emit("xorps xmm1, xmm1");
            emit("subsd xmm1, xmm0");
            emit("movq [rsp], xmm1");

            return VarType.FLOAT;
        }
    }
}


function factorNodeCode(n: TreeNode): VarType {
    //console.log("factor");
    //console.log(n);
    let child = n.children[0];
    //console.log(child.sym);
    switch (child.sym) {
        case "NUM":
            let i = parseInt(child.token.lexeme, 10);
            emit(`push qword ${i}`);
            return VarType.INT;
        case "FPNUM":
            let f = parseFloat(child.token.lexeme);
            let fs = f.toString();
            if (!fs.includes('.')) {
                fs += '.0';
                emit(`mov rax, __float64__(${fs})`);
                emit("push rax");
                return VarType.FLOAT;
            }
            emit(`mov rax, __float64__(${f})`);
            emit("push rax");
            return VarType.FLOAT;
        case "LP":
            if (n.children.length == 3) {
                return exprNodeCode(n.children[1]);
            } else if (n.children.length == 4) {
                let termType = n.children[1].token.lexeme;
                let factorType = factorNodeCode(n.children[3]);
                if (termType == 'int') {
                    if (factorType != VarType.INT) {
                        floatPop("xmm0");
                        emit("roundsd xmm0, xmm0, 0xb");
                        emit("cvtsd2si rax, xmm0");
                        emit("push rax");
                    }
                    return VarType.INT;
                } else if (termType == 'double') {
                    if (factorType != VarType.FLOAT) {
                        emit("pop rax");
                        emit("cvtsi2sd xmm0, rax");
                        floatPush("xmm0");
                    }
                    return VarType.FLOAT;
                } else {
                    throw new Error("WRONG TYPE");
                }
            } else {
                throw new Error("WRONG CHILDREN LENGTH");
            }
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

        //console.log("sumT", sumType, "termT", termType);
        if (sumType != termType) {
            throw new Error();
        } 

        if (sumType == VarType.INT) {

            emit(`pop rbx`);
            emit(`pop rax`);

            switch (n.children[1].sym) {
                case "PLUS":
                    emit(`add rax, rbx`);
                    break;
                case "MINUS":
                    emit(`sub rax, rbx`);
                    break;
                default:
                    ICE();
            }
            emit(`push rax`);
            return VarType.INT;
        } else if (sumType == VarType.FLOAT) {
            floatPop("xmm1");
            floatPop("xmm0");

            switch (n.children[1].sym) {
                case "PLUS":
                    emit("addsd xmm0, xmm1");
                    break;
                case "MINUS":
                    emit("subsd xmm0, xmm1");
                    break;
                default:
                    ICE();
            }
            floatPush("xmm0");
            return VarType.FLOAT;
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

            emit(`pop rax`);
            emit(`cmp [rsp], rax`);

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

            emit(`movzx qword rax, al`);
            emit(`mov [rsp], rax`);

            return VarType.INT;
        } else {
            throw new Error();
        }
    }
}

function convertStackTopToZeroOrOneInteger(type: VarType) {
    //console.log("convert");
    ////console.log(type);
    if (type != VarType.INT && type != VarType.FLOAT) {
        throw new Error("INCORRECT VARTYPE");
    }

    if (type == VarType.INT) {
        emit("cmp qword [rsp], 0");
        emit("setne al");
        emit(`movzx rax, al`);
        emit(`mov [rsp], rax`);
    } else if (type == VarType.FLOAT) {
        floatPop("xmm0");
        emit("xorps xmm1, xmm1");
        emit("cmpneqsd xmm0, xmm1");
        floatPush("xmm0");
        emit("and qword [rsp], 1");
    }
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

function floatPop(reg: string) {
    emit(`movq ${reg}, [rsp]`);
    emit("add rsp, 8");
}

function floatPush(reg: string) {
    emit("sub rsp, 8");
    emit(`movq [rsp], ${reg}`);
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