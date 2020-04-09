import { Token } from "./Token"
import { Grammar } from "./Grammar"



export class Tokenizer {
    grammar: Grammar;
    inputData: string;
    currentLine: number;
    idx: number;
    previous: Token;

    prevTokens: Token[] = [];

    constructor(grammar: Grammar) {
        this.grammar = grammar;
        this.idx = 0;
        this.currentLine = 1;
        this.grammar.m.set("WHITESPACE", "\\s+");
        this.grammar.m.set("COMMENT", "(/[*](.|\n)*?[*]/)|(//.+?\\n)");
        this.previous = null;
    }

    setInput(inputData: string) {
        this.inputData = inputData;
        this.currentLine = 1;
        this.idx = 0;
    }

    next(): Token {
        if (this.idx >= (this.inputData.length - 1)) {
            let cl = this.currentLine;
            return new Token("$", undefined, cl);
        }
        for (let i = 0; i < this.grammar.m.size; i++) {
            let sym = Array.from(this.grammar.m.keys())[i];

            let rex = new RegExp(this.grammar.m.get(sym), "y");
            //console.log(sym);
            rex.lastIndex = this.idx;
            //console.log("rex: " + rex);
            //console.log(this.inputData);
            let mat = rex.exec(this.inputData);
            //console.log(mat);
            //console.log("before mat");
            if (mat) {
//console.log("mat");
                let lexeme = mat[0];
                this.idx += lexeme.length;
                let tmpLine = this.currentLine;
                this.currentLine += lexeme.split('\n').length - 1;
                if (sym !== "WHITESPACE" && sym !== "COMMENT") {
                    let t = new Token(sym, lexeme, tmpLine);
                    this.prevTokens.push(t);
                    return t;
                } else {
                    //console.log("returning");
                    return this.next();
                }
            }
        }
        //console.log("before the throw");
        throw new Error("NOTHING TO RETURN");
    }

    prev(): Token {
        if (this.prevTokens.length >= 2) {
            return this.prevTokens[this.prevTokens.length - 2];
        }
        return undefined;
    }

    peek(times: number = 1): Token {
        let tmpidx = this.idx;
        let tmpcl = this.currentLine;
        let peekTok: Token = undefined;

        for (let i = 0; i < times; i++) {
            peekTok = this.next();
            this.prevTokens.pop();
        }

        this.idx = tmpidx;
        this.currentLine = tmpcl;
        return peekTok;
    }

    expect(sym: string) {
        let next = this.next();
        if (next.sym != sym) {
            throw new Error("Expected " + sym + " but next token is: " + next.sym);
        }
        return next;
    }

    peek2(): Token {
        let tmpidx = this.idx;
        let tmpcl = this.currentLine;
        let peekTok = this.next();
        let peek2Tok = this.next();
        this.idx = tmpidx;
        this.currentLine = tmpcl;
        this.prevTokens.pop();
        this.prevTokens.pop();

        return peek2Tok;
    }
}