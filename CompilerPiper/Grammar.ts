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

    getFollow(): Map<string, Set<string>> {
        let follow = new Map<string, Set<string>>();
        let stable = true;
        let nullableVals = this.getNullable();
        let firstVals = this.getFirst();
        let count = 0;
        let brokeOut = false;
        let base = follow;

        follow.set(this.nonterminals[0], new Set<string>().add("$"));

        while (true) {
            stable = true;
            for (let N = 0; N < this.nonterminals.length; N++) {

                let n = this.nonterminals[N];

                let productions = this.m.get(n).split("|");


                for (let P = 0; P < productions.length; P++) {
                    let prep = productions[P].trim().split(" ");
                    let p: string[] = [];

                    prep.forEach(pppoopoo => { if(pppoopoo != "" && pppoopoo.length != 0) p.push(pppoopoo) })

                    for (let i = 0; i < p.length; i++) {
                        let x = p[i].trim();

                        if (this.nonterminals.includes(x)) {
                            brokeOut = false;

                            base = follow;
                            for (let Y = i + 1; Y < p.length; Y++) {
                                let y = p[Y].trim();

                                let t0 = follow.get(x);
                                let t1 = firstVals.get(y);

                                if (t0 == undefined) {
                                    t0 = new Set<string>();
                                }

                                if (t1 == undefined) {
                                    t1 = new Set<string>();
                                }

                                let union = this.unionSets(t0, t1);

                                follow.set(x, union);

                                if (base.size != follow.size) {
                                    stable = false;
                                }

                                if (!nullableVals.has(y)) {
                                    brokeOut = true;
                                    break;
                                }
                            }

                            if (!brokeOut) {
                                let fx = follow.get(x);
                                let fn = follow.get(n);

                                if (fx == undefined) {
                                    fx = new Set<string>();
                                }

                                if (fn == undefined) {
                                    fn = new Set<string>();
                                }

                                let union1 = this.unionSets(fx, fn);
                                follow.set(x, union1);
                            }
                        }
                    }
                }
            }

            if (stable) {
                if (++count >= this.productions.length) {
                    break;
                }
            }
        }

        //console.log(follow);
        return follow;
    }

    private unionSets(s1: Set<string>, s2: Set<string>): Set<string> {
        let union = s1;

        if (union == undefined) {
            union = new Set<string>();
        }

        if (s2 == undefined) {
            s2 = new Set<string>();
        }
        //console.log("union: " + union.size + "\ts2: " + s2.size);

        s2.forEach((key) => union.add(key));
        //console.log("post union: " + union.size);

        return union;

    }
}