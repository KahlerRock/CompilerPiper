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
    }

    next(): Token {

        if (this.idx >= (this.inputData.length - 1)) {
            let cl = this.currentLine;
            this.currentLine = 1;
            this.idx = 0;
            return new Token("$", undefined, cl);
        }

        for (let i = 0; i < this.grammar.m.size; i++) {

            let sym = Array.from(this.grammar.m.keys())[i];

            let rex = new RegExp(this.grammar.m.get(sym), "gy");

            rex.lastIndex = this.idx;

            let mat = rex.exec(this.inputData);
            if (mat) {
                let lexeme = mat[0];
                this.idx += lexeme.length;
                let tmpLine = this.currentLine;
                this.currentLine += lexeme.split('\n').length - 1;
                if (sym !== "WHITESPACE" && sym !== "COMMENT") {
                    let t = new Token(sym, lexeme, tmpLine);
                    this.prevTokens.push(t);
                    return t;
                } else {
                    return this.next();
                }
            }
        }
        throw new Error();
    }

    prev(): Token {
        if (this.prevTokens.length >= 2) {
            return this.prevTokens[this.prevTokens.length - 2];
        }
        return undefined;
    }

    peek(): Token {
        let tmpidx = this.idx;
        let tmpcl = this.currentLine;
        let peekTok = this.next();
        this.idx = tmpidx;
        this.currentLine = tmpcl;
        this.prevTokens.pop();

        return peekTok;
    }
}