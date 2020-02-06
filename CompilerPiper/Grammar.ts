
export class Grammar {
    input: string;
    m: Map<string, string>;
    terminals: Array<string>;
    nonterminals: Array<string>;
    matErrorList: Array<string>;
    symbolList: Array<string>;
    constructor(input: string) {
        this.input = input;
        this.m = new Map();
        this.terminals = new Array<string>();
        this.nonterminals = new Array<string>();
        this.matErrorList = new Array<string>();
        this.symbolList = new Array<string>();

        let inputSplit = this.input.split("\n");

        console.log(inputSplit);
        for (let i = 0; i < inputSplit.length - 1; i++) {

            let split = inputSplit[i].split(" -> ");
            //console.log(split);
            if (split.length == 2) {
                let id = split[0];
                let reg = split[1];

                if (id != "") {
                    if (!this.m.has(id)) {
                        if (reg != "") {
                            try {

                                let r = new RegExp(reg);
                                this.m.set(id, reg.trim());

                                let rSplit = reg.split(" ");
                                if (rSplit.length == 1) {
                                    if (this.m.get(rSplit[0]) == undefined) {
                                        this.terminals.push(id);
                                    } else {
                                        this.nonterminals.push(id);
                                    }
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
                    if (!this.terminals.includes(c) && !this.nonterminals.includes(c)) {
                        throw new Error("ERROR: undefined symbol " + c);
                    }

                    this.symbolList.push(c);
                }
            }
        }


        //console.log(this.symbolList);

        //checks for unused nonterminals
        for (let i = 0; i < this.nonterminals.length; i++) {
            let t = this.nonterminals[i];
            if (!this.symbolList.includes(t)) {
                throw new Error("ERROR: unused nonterminal " + t);
            }
        }

        //checks for unused terminals
        for (let i = 0; i < this.terminals.length; i++) {
            let t = this.terminals[i];
            if (!this.symbolList.includes(t)) {
                let nt = "[" + t + "]";
                if (!this.symbolList.includes(nt)) {
                    throw new Error("ERROR: unused terminal " + t);
                }
            }
        }


    }
}