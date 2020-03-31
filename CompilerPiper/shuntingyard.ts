import { TreeNode } from "./NodeType";
import { Tokenizer } from "./Tokenizer";
import { Token } from "./Token";
import { Grammar } from "./Grammar";

let operandStack: TreeNode[] = [];
let operatorStack: TreeNode[] = [];


let gramgram =
    "POWOP -> [*][*]\n" +
    "MULOP -> [*/]\n" +
    "BITNOT -> [~]\n" +
    "ADDOP -> [-+]\n" +
    "NUM -> -?\\d+\n" +
    "COMMA -> [,]\n" + 
    "LP -> [(]\n" +
    "RP -> [)]\n" +
    "ID -> [A-Za-z_]\\w*\n" + 
    "func-call -> ID LP RP | ID LP NUM RP | ID LP NUM COMMA NUM RP\n";





let gram: Grammar = new Grammar(gramgram);


const opPrec: { [operator: string]: number } = {
    "LP": 0,
    "COMMA": 1,
    "ADDOP": 2, 
    "MULOP": 3,
    "BITNOT": 4, 
    "NEGATE": 5,
    "POWOP": 6,
    "func-call": 7
}

const opAssoc: { [operator: string]: string } = {
    "COMMA": "left",
    "ADDOP": "left",
    "MULOP": "left",
    "NEGATE": "right",
    "BITNOT": "right",
    "POWOP": "right",
    "func-call": "left"
}

const opArrity: { [operator: string]: number } = {
    "COMMA": 2,
    "ADDOP": 2,
    "MULOP": 2,
    "NEGATE": 1,
    "BITNOT": 1,
    "POWOP": 2,
    "func-call": 2
}

export function doOperation() {
    let opNode = operatorStack.pop();
    let c1 = operandStack.pop();

    if (opArrity[opNode.sym] == 2) {
        let c2 = operandStack.pop();
        opNode.addChild(c2);
    } else if (opNode.sym == "func-call") {
        opArrity['func-call'] = 2;
    }

    opNode.addChild(c1);

    operandStack.push(opNode);
}

export function parse(input: string) {
    operandStack = [];
    operatorStack = [];
    let tokenizer = new Tokenizer(gram);
    tokenizer.setInput(input);
    while (true) {
        let t = tokenizer.next();
        if (t.sym == "$") {
            break;
        }

        if (t.lexeme == "-") {
            let p = tokenizer.prev();
            if (p == undefined || p.sym == "LP" || opPrec[p.sym] != undefined) {
                t.sym = "NEGATE";
            }
        }

        let sym = t.sym;

        if (sym == "LP") {
            if (tokenizer.prev() != undefined && tokenizer.prev().sym == "ID") {
                let peekTok = tokenizer.peek();
                if (peekTok != undefined && peekTok.sym == "RP") {
                    opArrity['func-call'] = 1;
                    operatorStack.push(new TreeNode("func-call", undefined));
                    tokenizer.next();
                    doOperation();
                    continue;
                }
                opArrity['func-call'] = 2;
                operatorStack.push(new TreeNode('func-call', undefined));
            }
            operatorStack.push(new TreeNode(sym, t));
        } else if (opArrity[sym] == 1 && opAssoc[sym] == "right") {
            operatorStack.push(new TreeNode(sym, t));
        } else if (sym == "NUM") {
            operandStack.push(new TreeNode(sym, t));
        } else if (sym == "ID") {
            operandStack.push(new TreeNode(sym, t));
        } else if (sym == "RP") {
            while (true) {
                let top = operatorStack[operatorStack.length - 1];
                if (top != undefined && top.sym == "LP") {
                    operatorStack.pop();
                    break;
                }

                if (top == undefined) {
                    break;
                }

                doOperation();
            }
        } else {
            let assoc = opAssoc[sym];
            while (true) {
                //console.log("8erStack: " + operatorStack.length + "\tsym: " + sym);
                if (operatorStack.length == 0) {
                    break;
                }

                let a = operatorStack[operatorStack.length - 1].sym;

                if (assoc == "right" && opPrec[a] > opPrec[sym]) {
                    doOperation();
                } else if (assoc == "left" && opPrec[a] >= opPrec[sym]) {
                    doOperation();
                } else {
                    break;
                }
            }

            operatorStack.push(new TreeNode(t.sym, t));
        }
    }

    while (operatorStack.length != 0) {
        doOperation();
    }

    return operandStack[0];
}