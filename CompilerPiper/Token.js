"use strict";
exports.__esModule = true;
var Token = /** @class */ (function () {
    function Token(sym, lexeme, line) {
        this.sym = sym;
        this.lexeme = lexeme;
        this.line = line;
    }
    Token.prototype.toString = function () {
        return "[" + this.sym + " " + this.line + " " + this.lexeme + "]";
    };
    return Token;
}());
exports.Token = Token;
