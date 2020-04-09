"use strict";
exports.__esModule = true;
var NodeType_1 = require("./NodeType");
var Tokenizer_1 = require("./Tokenizer");
var Grammar_1 = require("./Grammar");
var gramgram = "SEMI -> ;\n" +
    "LBR -> [{]\n" +
    "RBR -> [}]\n" +
    "LP -> [(]\n" +
    "RP -> [)]\n" +
    "EQ ->  =\n" +
    "CMA ->  ,\n" +
    "IF ->  if\n" +
    "WHILE -> while\n" +
    "ELSE -> else\n" +
    "TYPE -> (int | double)\n" +
    "NUM -> [0-9]+\n" +
    "ID -> [A-Za-z_]+\n" +
    "\n" +
    "S -> stmt-list\n" +
    "stmt-list -> stmt stmt-list | lambda\n" +
    "stmt -> loop | cond | assign SEMI | LBR stmt-list RBR\n" +
    "loop -> WHILE LP expr RP stmt\n" +
    "cond -> IF LP expr RP stmt | IF LP expr RP stmt ELSE stmt\n" +
    "assign -> ID EQ expr\n" +
    "expr -> NUM | ID\n";
var T = new Tokenizer_1.Tokenizer(new Grammar_1.Grammar(gramgram));
function parse(input) {
    T.setInput(input);
    //console.log("parse");
    var tmp = parse_s();
    //console.log("***********");
    //console.log(tmp);
    return tmp;
}
exports.parse = parse;
function parse_s() {
    //console.log("parse_s");
    var n = new NodeType_1.TreeNode("S", undefined);
    n.addChild(parse_stmtList());
    if (T.peek().sym != "$") {
        return undefined;
    }
    return n;
}
function parse_stmtList() {
    //console.log("parse_stmtList");
    var n = new NodeType_1.TreeNode("stmt-list", undefined);
    var peek = T.peek().sym;
    //console.log(peek);
    if (peek == "WHILE" || peek == "IF" || peek == "ID" || peek == "LBR") {
        n.addChild(parse_stmt());
        n.addChild(parse_stmtList());
    }
    else if (peek == '$') {
        //n.addChild(new TreeNode("lambda", T.expect("lambda")));
        return n;
    }
    //console.log(n);
    return n;
}
function parse_stmt() {
    //console.log("parse_stmt");
    var n = new NodeType_1.TreeNode("stmt", undefined);
    var peek = T.peek().sym;
    if (peek == "WHILE") {
        n.addChild(parse_loop());
    }
    else if (peek == "IF") {
        n.addChild(parse_cond());
    }
    else if (peek == "ID") {
        n.addChild(parse_assign());
        n.addChild(new NodeType_1.TreeNode("SEMI", T.expect("SEMI")));
    }
    else if (peek == "LBR") {
        n.addChild(new NodeType_1.TreeNode("LBR", T.expect("LBR")));
        n.addChild(parse_stmtList());
        n.addChild(new NodeType_1.TreeNode("RBR", T.expect("RBR")));
    }
    else {
        throw new Error("Expected WHILE, IF, or ID but peek returned: " + peek);
    }
    //console.log(n);
    return n;
}
function parse_loop() {
    //console.log("parse_loop");
    var n = new NodeType_1.TreeNode("loop", undefined);
    n.addChild(new NodeType_1.TreeNode("WHILE", T.expect("WHILE")));
    n.addChild(new NodeType_1.TreeNode("LP", T.expect("LP")));
    n.addChild(parse_expr());
    n.addChild(new NodeType_1.TreeNode("RP", T.expect("RP")));
    n.addChild(parse_stmt());
    return n;
}
function parse_cond() {
    //console.log("parse_cond");
    var n = new NodeType_1.TreeNode("cond", undefined);
    n.addChild(new NodeType_1.TreeNode("IF", T.expect("IF")));
    n.addChild(new NodeType_1.TreeNode("LP", T.expect("LP")));
    n.addChild(parse_expr());
    n.addChild(new NodeType_1.TreeNode("RP", T.expect("RP")));
    n.addChild(parse_stmt());
    if (T.peek().sym == "ELSE") {
        n.addChild(new NodeType_1.TreeNode("ELSE", T.expect("ELSE")));
        n.addChild(parse_stmt());
    }
    //console.log(n);
    return n;
}
function parse_assign() {
    //console.log("parse_assign");
    var n = new NodeType_1.TreeNode("assign", undefined);
    //console.log(T.peek().sym);
    n.addChild(new NodeType_1.TreeNode("ID", T.expect("ID")));
    //console.log(T.peek().sym);
    n.addChild(new NodeType_1.TreeNode("EQ", T.expect("EQ")));
    n.addChild(parse_expr());
    //console.log(n);
    return n;
}
function parse_expr() {
    //console.log("parse_expr");
    var n = new NodeType_1.TreeNode("expr", undefined);
    var peek = T.peek().sym;
    if (peek == "NUM") {
        n.addChild(new NodeType_1.TreeNode("NUM", T.expect("NUM")));
    }
    else if (peek == "ID") {
        n.addChild(new NodeType_1.TreeNode("ID", T.expect("ID")));
    }
    //console.log(n);
    return n;
}
function parse_funcCall() {
    //console.log("parse_funcCall");
    var n = new NodeType_1.TreeNode("funcCall", undefined);
    return n;
}
