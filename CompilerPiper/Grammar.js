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
        this.dealingWithTerminalsOrNonterminalsInTheWayAlecSaysTodoItArbitrarilyFalseMeaningTerminals = false;
        var inputSplit = this.input.split("\n");
        //console.log("inputSplit: " + inputSplit);
        for (var i = 0; i < inputSplit.length - 1; i++) {
            if (inputSplit[i] == '') {
                this.dealingWithTerminalsOrNonterminalsInTheWayAlecSaysTodoItArbitrarilyFalseMeaningTerminals = true;
            }
            var split = inputSplit[i].split(" -> ");
            //console.log("split: " + split);
            if (split.length == 2) {
                var id = split[0];
                var reg = split[1];
                if (id != "") {
                    if (!this.m.has(id)) {
                        if (reg != "") {
                            try {
                                var r = new RegExp(reg);
                                this.m.set(id, reg.trim());
                                if (!this.dealingWithTerminalsOrNonterminalsInTheWayAlecSaysTodoItArbitrarilyFalseMeaningTerminals) {
                                    this.terminals.push(id);
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
        //console.log("nonterminals: " + this.nonterminals);
        //console.log("terminals: " + this.terminals);
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
                    if (!this.terminals.includes(c) && !this.nonterminals.includes(c) && c != "lambda") {
                        //throw new Error("ERROR: undefined symbol " + c);
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
        /*let search: Set<string> = new Set();
        let start_node: NodeType;
        if (this.nonterminals.length !== 0) {
            start_node = new NodeType(this.nonterminals[0][0]);
            this.dfs(start_node, search);
        }*/
    }
    /*dfs(n: NodeType, v: Set<string>) {
        v.add(n.label);
        let term = this.nonterminals.find(t => t[0] == n.label);

        if (term != undefined) {
            let str = term[1];
            str.replace(new RegExp('\\|', 'g'), ' ');
            str.replace(new RegExp(',', 'g'), ' ');
            let strSplit = str.split(new RegExp(' ', 'g'));
            for (let t in strSplit) {
                let tt = t.trim();

                if (tt != '') {
                    if (tt == 'lambda') {
                        tt = '';
                    }
                    let nn: NodeType = new NodeType(tt);
                    n.n.push(nn);
                }
            }
        }
        if (n.n != undefined) {
            for (let i = 0; i < n.n.length; i++) {
                let t = n.n[i];
                if (!v.has(t.label)) {
                    this.dfs(t, v);
                }
            }
        }
    }*/
    Grammar.prototype.getNullable = function () {
        var nullable = new Set();
        var stable = true;
        while (true) {
            stable = true;
            for (var i = 0; i < this.nonterminals.length; i++) {
                var term = this.nonterminals[i];
                if (!nullable.has(term)) {
                    var val = this.m.get(term);
                    //console.log("val: " + val);
                    var valSplit = val.split("|");
                    //console.log("valSplit -- " + valSplit);
                    for (var j = 0; j < valSplit.length; j++) {
                        if (valSplit[j].trim().split(' ').every(function (s) { return nullable.has(s) || s == "lambda"; })) {
                            nullable.add(term);
                            stable = false;
                        }
                    }
                }
            }
            if (stable) {
                break;
            }
        }
        return nullable;
    };
    return Grammar;
}());
exports.Grammar = Grammar;
