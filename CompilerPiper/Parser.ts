import { TreeNode } from './NodeType';
import { Tokenizer } from './Tokenizer';
import { Grammar } from './Grammar';

let gramgram = "SEMI -> [;]\n" +
                "LBR -> [{]\n" +
                "RBR -> [}]\n" +
                "LP -> [(]\n" +
                "RP -> [)]\n" +
                "EQ ->  [=]\n" +
                "CMA ->  [,]\n" +
                "IF ->  \bif\b\n" + 
                "WHILE -> \bwhile\b\n" + 
                "ELSE -> \belse\b\n" + 
                "TYPE -> \b(int\| double) \b\n" + 
                "NUM -> \d +\n" + 
                "ID -> \[A - Za - z\_\]+\n" +
                "\n\n"+
                "S -> stmt - list\n" + 
                "stmt-list -> stmt stmt-list | lambda\n" + 
                "stmt -> loop | cond | assign SEMI | LBR stmt-list RBR\n" + 
                "loop -> WHILE LP expr RP stmt\n" + 
                "cond -> IF LP expr RP stmt | IF LP expr RP stmt ELSE stmt\n" +
                "assign -> ID EQ expr\n" + 
                "expr -> NUM | ID\n";

let T: Tokenizer = new Tokenizer(new Grammar(gramgram));
export function parse(input: string) {
    T.setInput(input);
    console.log("parse");
    return parse_s();
}

function parse_s() {
    console.log("parse_s");
    return parse_stmtList();
}

function parse_stmtList() {
    console.log("parse_stmtList");
    let n = new TreeNode("stmt-list", undefined);
    let peek = T.peek().sym;
    console.log(peek);
    if (peek == "WHILE" || peek == "IF" || peek == "ID") {
        n.addChild(parse_stmt());
        n.addChild(parse_stmtList());
    } else if (T.peek().sym == '$') {
        n.addChild(new TreeNode("lambda", T.expect("lambda")));
    } else {
        throw new Error("Expected stmt but peek returned: " + T.peek().sym);
    }
    return n;
}

function parse_stmt() {
    console.log("parse_stmt");
    let n = new TreeNode("stmt", undefined);
    let peek = T.peek().sym;
    if (peek == "WHILE") {
        n.addChild(parse_loop());
    } else if (peek == "IF") {
        n.addChild(parse_cond());
    } else if (peek == "ID") {
        let peek2 = T.peek(2).sym;
        if (peek2 == "EQ") {
            n.addChild(parse_assign());
        } else if (peek2 == "LP") {
            n.addChild(parse_funcCall());
        } else {
            throw new Error("Expected EQ or LP but peek2 returned: " + peek2);
        }
        T.expect("SEMI");
    } else if (peek == "LBR") {
        n.addChild(new TreeNode("LBR", T.expect("LBR")));
        if (T.peek().sym != "RBR") {
            n.addChild(parse_stmtList());
        }
        n.addChild(new TreeNode("RBR", T.expect("RBR")));
    } else {
        throw new Error("Expected WHILE, IF, or ID but peek returned: " + peek);
    }

    return n;
}

function parse_loop() {
    console.log("parse_loop");
    let n = new TreeNode("loop", undefined);
    n.addChild(new TreeNode("WHILE", T.expect("WHILE")));
    n.addChild(new TreeNode("LP", T.expect("LP")));
    if (T.peek().sym == "NUM" || T.peek().sym == "ID") {
        n.addChild(parse_expr());
    } else {
        throw new Error("Expected expr but peek returned: " + T.peek().sym);
    }
    n.addChild(new TreeNode("RP", T.expect("RP")));
    if (T.peek().sym == "WHILE" || T.peek().sym == "IF" || T.peek().sym == "ID") {
        n.addChild(parse_stmt());
    } else {
        throw new Error("Expected stmt but peek returned: " + T.peek().sym)
    }
    return n;
}

function parse_cond() {
    console.log("parse_cond");
    let n = new TreeNode("cond", undefined);
    n.addChild(new TreeNode("IF", T.expect("IF")));
    n.addChild(new TreeNode("LP", T.expect("LP")));
    if (T.peek().sym == "NUM" || T.peek().sym == "ID") {
        n.addChild(parse_expr());
    } else {
        throw new Error("Expected expr but peek returned: " + T.peek().sym);
    }
    n.addChild(new TreeNode("RP", T.expect("RP")));
    if (T.peek().sym == "WHILE" || T.peek().sym == "IF" || T.peek().sym == "ID") {
        n.addChild(parse_stmt());
    } else {
        throw new Error("Expected stmt but peek returned: " + T.peek().sym);
    }
    return n;
}

function parse_assign() {
    console.log("parse_assign");
    let n = new TreeNode("assign", undefined);
    n.addChild(new TreeNode("ID", T.expect("ID")));
    n.addChild(new TreeNode("EQ", T.expect("EQ")));
    if (T.peek().sym == "NUM" || T.peek().sym == "ID") {
        n.addChild(parse_expr());
    } else {
        throw new Error("Expected expr but peek returned: " + T.peek().sym);
    }
    return n;
}

function parse_expr() {
    console.log("parse_expr");
    let n = new TreeNode("expr", undefined);
    let peek = T.peek().sym;
    if (peek == "NUM") {
        n.addChild(new TreeNode("NUM", T.expect("NUM")));
    } else if (peek == "ID") {
        n.addChild(new TreeNode("ID", T.expect("ID")));
    } else {
        throw new Error("Expected NUM or ID but peek returned: " + peek);
    }
    return n;
}

function parse_funcCall() {
    console.log("parse_funcCall");
    let n = new TreeNode("funcCall", undefined);

    return n;
}
