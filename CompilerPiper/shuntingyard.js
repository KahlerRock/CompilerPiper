"use strict";
exports.__esModule = true;
var NodeType_1 = require("./NodeType");
var Tokenizer_1 = require("./Tokenizer");
var Grammar_1 = require("./Grammar");
var operandStack = [];
var operatorStack = [];
var gramgram = "POWOP -> [*][*]\n" +
    "MULOP -> [*/]\n" +
    "BITNOT -> [~]\n" +
    "ADDOP -> [-+]\n" +
    "NUM -> -?\\d+\n" +
    "COMMA -> [,]\n" +
    "LP -> [(]\n" +
    "RP -> [)]\n" +
    "ID -> [A-Za-z_]\\w*\n" +
    "func-call -> ID LP RP | ID LP NUM RP | ID LP NUM COMMA NUM RP\n";
var gram = new Grammar_1.Grammar(gramgram);
var opPrec = {
    "LP": 0,
    "COMMA": 1,
    "ADDOP": 2,
    "MULOP": 3,
    "BITNOT": 4,
    "NEGATE": 5,
    "POWOP": 6,
    "func-call": 7
};
var opAssoc = {
    "COMMA": "left",
    "ADDOP": "left",
    "MULOP": "left",
    "NEGATE": "right",
    "BITNOT": "right",
    "POWOP": "right",
    "func-call": "left"
};
var opArrity = {
    "COMMA": 2,
    "ADDOP": 2,
    "MULOP": 2,
    "NEGATE": 1,
    "BITNOT": 1,
    "POWOP": 2,
    "func-call": 2
};
function doOperation() {
    var opNode = operatorStack.pop();
    var c1 = operandStack.pop();
    if (opArrity[opNode.sym] == 2) {
        var c2 = operandStack.pop();
        opNode.addChild(c2);
    }
    else if (opNode.sym == "func-call") {
        opArrity['func-call'] = 2;
    }
    opNode.addChild(c1);
    operandStack.push(opNode);
}
exports.doOperation = doOperation;
function parse(input) {
    operandStack = [];
    operatorStack = [];
    var tokenizer = new Tokenizer_1.Tokenizer(gram);
    tokenizer.setInput(input);
    while (true) {
        var t = tokenizer.next();
        if (t.sym == "$") {
            break;
        }
        if (t.lexeme == "-") {
            var p = tokenizer.prev();
            if (p == undefined || p.sym == "LP" || opPrec[p.sym] != undefined) {
                t.sym = "NEGATE";
            }
        }
        var sym = t.sym;
        if (sym == "LP") {
            if (tokenizer.prev() != undefined && tokenizer.prev().sym == "ID") {
                var peekTok = tokenizer.peek();
                if (peekTok != undefined && peekTok.sym == "RP") {
                    opArrity['func-call'] = 1;
                    operatorStack.push(new NodeType_1.TreeNode("func-call", undefined));
                    tokenizer.next();
                    doOperation();
                    continue;
                }
                opArrity['func-call'] = 2;
                operatorStack.push(new NodeType_1.TreeNode('func-call', undefined));
            }
            operatorStack.push(new NodeType_1.TreeNode(sym, t));
        }
        else if (opArrity[sym] == 1 && opAssoc[sym] == "right") {
            operatorStack.push(new NodeType_1.TreeNode(sym, t));
        }
        else if (sym == "NUM") {
            operandStack.push(new NodeType_1.TreeNode(sym, t));
        }
        else if (sym == "ID") {
            operandStack.push(new NodeType_1.TreeNode(sym, t));
        }
        else if (sym == "RP") {
            while (true) {
                var top_1 = operatorStack[operatorStack.length - 1];
                if (top_1 != undefined && top_1.sym == "LP") {
                    operatorStack.pop();
                    break;
                }
                if (top_1 == undefined) {
                    break;
                }
                doOperation();
            }
        }
        else {
            var assoc = opAssoc[sym];
            while (true) {
                //console.log("8erStack: " + operatorStack.length + "\tsym: " + sym);
                if (operatorStack.length == 0) {
                    break;
                }
                var a = operatorStack[operatorStack.length - 1].sym;
                if (assoc == "right" && opPrec[a] > opPrec[sym]) {
                    doOperation();
                }
                else if (assoc == "left" && opPrec[a] >= opPrec[sym]) {
                    doOperation();
                }
                else {
                    break;
                }
            }
            operatorStack.push(new NodeType_1.TreeNode(t.sym, t));
        }
    }
    while (operatorStack.length != 0) {
        doOperation();
    }
    return operandStack[0];
}
exports.parse = parse;
