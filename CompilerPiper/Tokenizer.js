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
        if (this.idx >= (this.inputData.length - 1)) {
            var cl = this.currentLine;
            this.currentLine = 1;
            this.idx = 0;
            return new Token_1.Token("$", undefined, cl);
        }
        for (var i = 0; i < this.grammar.m.size; i++) {
            var sym = Array.from(this.grammar.m.keys())[i];
            var rex = new RegExp(this.grammar.m.get(sym), "gy");
            rex.lastIndex = this.idx;
            var mat = rex.exec(this.inputData);
            if (mat) {
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
                    return this.next();
                }
            }
        }
        throw new Error();
    };
    Tokenizer.prototype.prev = function () {
        if (this.prevTokens.length >= 2) {
            return this.prevTokens[this.prevTokens.length - 2];
        }
        return undefined;
    };
    Tokenizer.prototype.peek = function () {
        var tmpidx = this.idx;
        var tmpcl = this.currentLine;
        var peekTok = this.next();
        this.idx = tmpidx;
        this.currentLine = tmpcl;
        this.prevTokens.pop();
        return peekTok;
    };
    return Tokenizer;
}());
exports.Tokenizer = Tokenizer;
