import { Token } from './Token';
import { TreeNode } from './NodeType';
import { makeAsm } from './asm';

declare var require: any;
let antlr4 = require('./antlr4');
let Lexer = require('./gramLexer.js').gramLexer;
let Parser = require('./gramParser.js').gramParser;

class ErrorHandler {
    syntaxError(rec: any, sym: any, line: number,
        column: number, msg: string, e: any) {
        console.log("Syntax Error: ", msg, " on line", line,
            " at column ", column);
        throw new Error("Syntax error in ANTLR parse");
    }
}

export function parse(txt: string): string {
    let stream = new antlr4.InputStream(txt);
    let lexer = new Lexer(stream);
    let tokens = new antlr4.CommonTokenStream(lexer);
    let parser = new Parser(tokens);
    parser.buildParseTrees = true;

    let handler = new ErrorHandler();
    lexer.removeErrorListeners();
    lexer.addErrorListener(handler);
    parser.removeErrorListeners();
    parser.addErrorListener(handler);
    let antlrroot = parser.program();

    let root: TreeNode = walk(parser, antlrroot);
   
    return makeAsm(root);
}

function walk(parser: any, node: any) {
    let p: any = node.getPayload();
    if (p.ruleIndex === undefined) {
        let line: number = p.line;
        let lexeme: string = p.text;
        let ty: number = p.type;
        let sym: string = parser.symbolicNames[ty];
        if (sym === null) {
            sym = lexeme.toUpperCase();
        }
        let T = new Token(sym, lexeme, line);
        return new TreeNode(sym, T);
    } else {
        let idx: number = p.ruleIndex;
        let sym: string = parser.ruleNames[idx];
        let N = new TreeNode(sym, undefined);

        for (let i = 0; i < node.getChildCount(); ++i) {
            let child: any = node.getChild(i);
            N.children.push(walk(parser, child));
        }
        return N;
    }
}

