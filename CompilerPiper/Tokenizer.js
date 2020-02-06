"use strict";
exports.__esModule = true;
var Token_1 = require("./Token");
var Tokenizer = /** @class */ (function () {
    function Tokenizer(grammar) {
        this.grammar = grammar;
        this.idx = 0;
        this.currentLine = 1;
        this.grammar.m.set("WHITESPACE", "\\s+");
        this.grammar.m.set("COMMENT", "(/[*](.|\n)*?[*]/)|(//.+?\\n)");
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
                    return new Token_1.Token(sym, lexeme, tmpLine);
                }
                else {
                    return this.next();
                }
            }
        }
        throw new Error();
    };
    return Tokenizer;
}());
exports.Tokenizer = Tokenizer;
