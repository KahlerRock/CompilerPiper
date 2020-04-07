export class Grammar {
    input: string;
    m: Map<string, string>;
    terminals: Array<string>;
    nonterminals: Array<string>;
    productions: Array<string>;
    matErrorList: Array<string>;
    symbolList: Array<string>;
    dealingWithTerminalsOrNonterminalsInTheWayAlecSaysTodoItArbitrarilyFalseMeaningTerminals: boolean;
    
    constructor(input: string) {
        this.input = input;
        this.m = new Map();
        this.terminals = new Array<string>();
        this.nonterminals = new Array<string>();
        this.matErrorList = new Array<string>();
        this.symbolList = new Array<string>();
        this.productions = new Array<string>();
        this.dealingWithTerminalsOrNonterminalsInTheWayAlecSaysTodoItArbitrarilyFalseMeaningTerminals = false;

        let inputSplit = this.input.split("\n");

        //console.log("inputSplit: " + inputSplit);
        for (let i = 0; i < inputSplit.length - 1; i++) {
            if (inputSplit[i] == '') {
                this.dealingWithTerminalsOrNonterminalsInTheWayAlecSaysTodoItArbitrarilyFalseMeaningTerminals = true;
            }
            let split = inputSplit[i].split(" -> ");
            //console.log("split: " + split);
            if (split.length == 2) {
                let id = split[0];
                let reg = split[1];

                if (id != "") {
                    if (!this.m.has(id)) {
                        if (reg != "") {
                            try {

                                let r = new RegExp(reg);
                                this.m.set(id, reg.trim());

                                if (!this.dealingWithTerminalsOrNonterminalsInTheWayAlecSaysTodoItArbitrarilyFalseMeaningTerminals) {
                                    this.terminals.push(id);
                                } else {
                                    this.nonterminals.push(id);
                                }
                            } catch{
                                throw new Error("ERROR: failed to create regex");
                            }
                        } else {
                            throw new Error("ERROR: empty regex");
                        }
                    } else {
                        this.matErrorList.push(id);
                        this.matErrorList.push(reg);
                    }
                }
            }
        }

        //console.log("nonterminals: " + this.nonterminals);
        //console.log("terminals: " + this.terminals);

        //combines matching IDs
        for (let i = 0; i < this.matErrorList.length; i += 2) {
            //console.log(this.matErrorList);
            let erid = this.matErrorList[i];
            let erreg = this.matErrorList[i + 1];
            //console.log(erreg.split(" "));
            if (this.terminals.indexOf(erid) < 0 || erreg.split(" ").length > 1) {
                let tReg = this.m.get(erid);
                tReg += (" | " + erreg);
                this.m.delete(erid);
                this.m.set(erid, tReg);
            } else {
                throw new Error("ERROR: repeated terminal id");
            }
        }

        //console.log(this.m);
        //console.log("terminals: " + this.terminals);
        //console.log("nonterminals: " + this.nonterminals);

        //checks for undefined symbols
        for (let i = 0; i < this.nonterminals.length; i++) {
            let t = this.nonterminals[i];
            let val = this.m.get(t);
            let valSplit = val.split(" ");

            for (let j = 0; j < valSplit.length; j++) {
                let c = valSplit[j];
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
        for (let i = 0; i < this.nonterminals.length; i++) {
            let t = this.nonterminals[i];
            if (!this.nonterminals.includes(t)) {
                throw new Error("ERROR: unused nonterminal " + t);
            }
        }

        //checks for unused terminals
        for (let i = 0; i < this.terminals.length; i++) {
            let t = this.terminals[i];
            if (!this.terminals.includes(t)) {
                let nt = "[" + t + "]";
                if (!this.terminals.includes(nt)) {
                    throw new Error("ERROR: unused terminal " + t);
                }
            }
        }

        for (let i = 0; i < this.nonterminals.length; i++) {
            let p = this.m.get(this.nonterminals[i]);
            let ps = p.split(new RegExp("\\|", "g"));
            for (let j = 0; j < ps.length; j++) {
                this.productions.push(ps[j]);
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

    getNullable(): Set<string> {
        let nullable: Set<string> = new Set<string>();
        let stable = true;

        while (true) {
            stable = true;
            for (let i = 0; i < this.nonterminals.length; i++) {
                let term = this.nonterminals[i];
                if (!nullable.has(term)) {
                    let val = this.m.get(term);

                    let valSplit = val.split("|");

                    for (let j = 0; j < valSplit.length; j++) {
                        if (valSplit[j].trim().split(' ').every((s: string) => nullable.has(s) || s == "lambda")) {
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
    }

    getFirst(): Map<string, Set<string>> {
        let first = new Map<string, Set<string>>();
        let nullableVals = this.getNullable();
        let stable = true;
        let count = 0;

        for (let S in this.terminals) {
            let s = this.terminals[S];
            let firstSet = new Set<string>();
            firstSet.add(s);
            first.set(s, firstSet);
        }

        while (true) {
            stable = true;
            for (let N in this.nonterminals) {
                let n = this.nonterminals[N];
                let prod = this.m.get(n);
                if (prod != undefined) {
                    prod = prod.replace("lambda", '');
                    //console.log("prod != undefined");
                    let prodSplit = prod.split("|");
                    //console.log("prodSplit: " + prodSplit);
                    for (let X in prodSplit) {
                        let x = prodSplit[X].trim();
                        let pSplit = x.split(' ');
                        for (let Y in pSplit) {
                            let y = pSplit[Y];
                            let union = this.unionSets(first.get(n), first.get(y));
                            let base = first;

                            //console.log(first.get(n));
                            first.set(n, union);

                            if (base.size != first.size) {
                                stable = false;
                            }

                            if (!nullableVals.has(y)) {
                                break;
                            }
                        }
                    }
                }
            }
            if (stable) {
                //console.log("count: " + count + "\tprodCount: " + prodCount);
                if (++count >= this.productions.length) {
                    break;
                }
            }
        }
        return first;
    }

    private unionSets(s1: Set<string>, s2: Set<string>): Set<string> {
        //console.log("s1");
        //console.log(s1);
        //console.log("s2");
        //console.log(s2);
        let union = s1;
        if (union == undefined) {
            union = new Set<string>();
        }

        if (s2 == undefined) {
            s2 = new Set<string>();
        }

        s2.forEach(union.add, union);

        return union;

    }
}