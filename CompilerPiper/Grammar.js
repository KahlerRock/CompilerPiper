"use strict";
exports.__esModule = true;
var Grammar = /** @class */ (function () {
    function Grammar(input) {
        this.input = input;
        this.m = new Map();
        this.terminals = new Array();
        this.nonterminals = new Array();
        this.matErrorList = new Array();
        this.symbolList = new Array();
        var inputSplit = this.input.split("\n");
        console.log(inputSplit);
        for (var i = 0; i < inputSplit.length - 1; i++) {
            var split = inputSplit[i].split(" -> ");
            //console.log(split);
            if (split.length == 2) {
                var id = split[0];
                var reg = split[1];
                if (id != "") {
                    if (!this.m.has(id)) {
                        if (reg != "") {
                            try {
                                var r = new RegExp(reg);
                                this.m.set(id, reg.trim());
                                var rSplit = reg.split(" ");
                                if (rSplit.length == 1) {
                                    if (this.m.get(rSplit[0]) == undefined) {
                                        this.terminals.push(id);
                                    }
                                    else {
                                        this.nonterminals.push(id);
                                    }
                                }
                                else {
                                    this.nonterminals.push(id);
                                }
                            }
                            catch (_a) {
                                throw new Error("ERROR: failed to create regex");
                            }
                        }
                        else {
                            throw new Error("ERROR: empty regex");
                        }
                    }
                    else {
                        this.matErrorList.push(id);
                        this.matErrorList.push(reg);
                    }
                }
            }
        }
        //combines matching IDs
        for (var i = 0; i < this.matErrorList.length; i += 2) {
            //console.log(this.matErrorList);
            var erid = this.matErrorList[i];
            var erreg = this.matErrorList[i + 1];
            //console.log(erreg.split(" "));
            if (this.terminals.indexOf(erid) < 0 || erreg.split(" ").length > 1) {
                var tReg = this.m.get(erid);
                tReg += (" | " + erreg);
                this.m["delete"](erid);
                this.m.set(erid, tReg);
            }
            else {
                throw new Error("ERROR: repeated terminal id");
            }
        }
        //console.log(this.m);
        //console.log("terminals: " + this.terminals);
        //console.log("nonterminals: " + this.nonterminals);
        //checks for undefined symbols
        for (var i = 0; i < this.nonterminals.length; i++) {
            var t = this.nonterminals[i];
            var val = this.m.get(t);
            var valSplit = val.split(" ");
            for (var j = 0; j < valSplit.length; j++) {
                var c = valSplit[j];
                if (c != "|") {
                    if (!this.terminals.includes(c) && !this.nonterminals.includes(c)) {
                        throw new Error("ERROR: undefined symbol " + c);
                    }
                    this.symbolList.push(c);
                }
            }
        }
        /*let set = new Set<string>();
        let node = new NodeType(this.nonterminals[0]);

        this.dfs(node, set);

        console.log(set);
        */
        //console.log(this.symbolList);
        //checks for unused nonterminals
        for (var i = 0; i < this.nonterminals.length; i++) {
            var t = this.nonterminals[i];
            if (!this.nonterminals.includes(t)) {
                throw new Error("ERROR: unused nonterminal " + t);
            }
        }
        //checks for unused terminals
        for (var i = 0; i < this.terminals.length; i++) {
            var t = this.terminals[i];
            if (!this.terminals.includes(t)) {
                var nt = "[" + t + "]";
                if (!this.terminals.includes(nt)) {
                    throw new Error("ERROR: unused terminal " + t);
                }
            }
        }
    }
    Grammar.prototype.dfs = function (N, v) {
        var _this = this;
        v.add(N.label);
        var val = this.m.get(N.label);
        var valSplit = val.split(" ");
        for (var i = 0; i < valSplit.length; i++) {
            var t = valSplit[i];
            if (t != "," && t != "|") {
                v.add(t);
            }
        }
        N.n.forEach(function (w) {
            if (!v.has(w.label)) {
                _this.dfs(w, v);
            }
        });
    };
    return Grammar;
}());
exports.Grammar = Grammar;
