import { TreeNode } from './NodeType';
import { Tokenizer } from './Tokenizer';
import { Grammar } from './Grammar';

let gramgram = "SEMI -> ;\n" +
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
                "\n"+
                "S -> stmt-list\n" + 
                "stmt-list -> stmt stmt-list | lambda\n" + 
                "stmt -> loop | cond | assign SEMI | LBR stmt-list RBR\n" + 
                "loop -> WHILE LP expr RP stmt\n" + 
                "cond -> IF LP expr RP stmt | IF LP expr RP stmt ELSE stmt\n" +
                "assign -> ID EQ expr\n" + 
                "expr -> NUM | ID\n";

let T: Tokenizer = new Tokenizer(new Grammar(gramgram));
export function parse(input: string) {
    T.setInput(input);
    //console.log("parse");
    let tmp = parse_s();
    //console.log("***********");
    //console.log(tmp);
    
    return tmp;
}

function parse_s() {
    //console.log("parse_s");
    let n = new TreeNode("S", undefined);
    n.addChild(parse_stmtList());
    if (T.peek().sym != "$") {
        return undefined;
    }
    return n;
}
function parse_stmtList() {
    //console.log("parse_stmtList");
    let n = new TreeNode("stmt-list", undefined);
    let peek = T.peek().sym;
    //console.log(peek);
    if (peek == "WHILE" || peek == "IF" || peek == "ID" || peek == "LBR") {
        n.addChild(parse_stmt());
        n.addChild(parse_stmtList());
    } else if (peek == '$') {
        //n.addChild(new TreeNode("lambda", T.expect("lambda")));
        return n;
    }
    //console.log(n);
    return n;
}

function parse_stmt() {
    //console.log("parse_stmt");
    let n = new TreeNode("stmt", undefined);
    let peek = T.peek().sym;
    if (peek == "WHILE") {
        n.addChild(parse_loop());
    } else if (peek == "IF") {
        n.addChild(parse_cond());
    } else if (peek == "ID") {
        n.addChild(parse_assign());
        n.addChild(new TreeNode("SEMI", T.expect("SEMI")));
    } else if (peek == "LBR") {
        n.addChild(new TreeNode("LBR", T.expect("LBR")));
        n.addChild(parse_stmtList());
        n.addChild(new TreeNode("RBR", T.expect("RBR")));
    } else {
        throw new Error("Expected WHILE, IF, or ID but peek returned: " + peek);
    }
    //console.log(n);
    return n;
}

function parse_loop() {
    //console.log("parse_loop");
    let n = new TreeNode("loop", undefined);
    n.addChild(new TreeNode("WHILE", T.expect("WHILE")));
    n.addChild(new TreeNode("LP", T.expect("LP")));
    n.addChild(parse_expr());
    n.addChild(new TreeNode("RP", T.expect("RP")));
                
    n.addChild(parse_stmt());
    return n;
}

function parse_cond() {
    //console.log("parse_cond");
    let n = new TreeNode("cond", undefined);
    n.addChild(new TreeNode("IF", T.expect("IF")));
    n.addChild(new TreeNode("LP", T.expect("LP")));
    n.addChild(parse_expr());
    n.addChild(new TreeNode("RP", T.expect("RP")));
    n.addChild(parse_stmt());
    if (T.peek().sym == "ELSE") {
        n.addChild(new TreeNode("ELSE", T.expect("ELSE")));
        n.addChild(parse_stmt());
    }
    //console.log(n);
    return n;
}

function parse_assign() {
    //console.log("parse_assign");
    let n = new TreeNode("assign", undefined);
    //console.log(T.peek().sym);
    n.addChild(new TreeNode("ID", T.expect("ID")));
    //console.log(T.peek().sym);
    n.addChild(new TreeNode("EQ", T.expect("EQ")));
    n.addChild(parse_expr());
    //console.log(n);
    return n;
}

function parse_expr() {
    //console.log("parse_expr");
    let n = new TreeNode("expr", undefined);
    let peek = T.peek().sym;
    if (peek == "NUM") {
        n.addChild(new TreeNode("NUM", T.expect("NUM")));
    } else if (peek == "ID") {
        n.addChild(new TreeNode("ID", T.expect("ID")));
    }
    //console.log(n);
    return n;
}

