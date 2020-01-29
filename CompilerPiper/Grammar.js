"use strict";
exports.__esModule = true;
var Grammar = /** @class */ (function () {
    function Grammar(input) {
        this.input = input;
        this.m = new Map();
        var inputSplit = this.input.split("\n");
        for (var i = 0; i < inputSplit.length - 1; i++) {
            var split = inputSplit[i].split(" -> ");
            if (split.length == 2) {
                var id = split[0];
                var reg = split[1];
                if (id != "") {
                    if (!this.m.has(id)) {
                        if (reg != "") {
                            try {
                                var r = new RegExp(reg);
                                this.m.set(id, r);
                            }
                            catch (_a) {
                                throw new Error();
                            }
                        }
                        else {
                            throw new Error();
                        }
                    }
                    else {
                        throw new Error();
                    }
                }
            }
            else {
                throw new Error();
            }
        }
        console.log(this.m);
    }
    return Grammar;
}());
exports.Grammar = Grammar;
