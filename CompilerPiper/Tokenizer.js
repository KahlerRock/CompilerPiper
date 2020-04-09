"use strict";
exports.__esModule = true;
var Token_1 = require("./Token");
var Tokenizer = /** @class */ (function () {
    function Tokenizer(grammar) {
        this.prevTokens = [];
        this.grammar = grammar;
        this.idx = 0;
        this.currentLine = 1;
        this.grammar.m.set("WHITESPACE", "\\s+");
        this.grammar.m.set("COMMENT", "(/[*](.|\n)*?[*]/)|(//.+?\\n)");
        this.previous = null;
    }
    Tokenizer.prototype.setInput = function (inputData) {
        this.inputData = inputData;
    };
    Tokenizer.prototype.next = function () {
        console.log("this.next()");
        if (this.idx >= (this.inputData.length - 1)) {
            var cl = this.currentLine;
            this.currentLine = 1;
            this.idx = 0;
            return new Token_1.Token("$", undefined, cl);
        }
        console.log("not $");
        for (var i = 0; i < this.grammar.m.size; i++) {
            var sym = Array.from(this.grammar.m.keys())[i];
            var rex = new RegExp(this.grammar.m.get(sym), "gy");
            rex.lastIndex = this.idx;
            var mat = rex.exec(this.inputData);
            console.log("before mat");
            if (mat) {
                console.log("mat");
                var lexeme = mat[0];
                this.idx += lexeme.length;
                var tmpLine = this.currentLine;
                this.currentLine += lexeme.split('\n').length - 1;
                if (sym !== "WHITESPACE" && sym !== "COMMENT") {
                    var t = new Token_1.Token(sym, lexeme, tmpLine);
                    this.prevTokens.push(t);
                    return t;
                }
                else {
                    console.log("returning");
                    return this.next();
                }
            }
        }
        throw new Error("NOTHING TO RETURN");
    };
    Tokenizer.prototype.prev = function () {
        if (this.prevTokens.length >= 2) {
            return this.prevTokens[this.prevTokens.length - 2];
        }
        return undefined;
    };
    Tokenizer.prototype.peek = function (times) {
        if (times === void 0) { times = 1; }
        var tmpidx = this.idx;
        var tmpcl = this.currentLine;
        var peekTok = undefined;
        for (var i = 0; i < times; i++) {
            peekTok = this.next();
            this.prevTokens.pop();
        }
        this.idx = tmpidx;
        this.currentLine = tmpcl;
        return peekTok;
    };
    Tokenizer.prototype.expect = function (sym) {
        var next = this.next();
        if (next.sym != sym) {
            throw new Error("Expected " + sym + " but next token is: " + next.sym);
        }
        return next;
    };
    Tokenizer.prototype.peek2 = function () {
        var tmpidx = this.idx;
        var tmpcl = this.currentLine;
        var peekTok = this.next();
        var peek2Tok = this.next();
        this.idx = tmpidx;
        this.currentLine = tmpcl;
        this.prevTokens.pop();
        this.prevTokens.pop();
        return peek2Tok;
    };
    return Tokenizer;
}());
exports.Tokenizer = Tokenizer;
