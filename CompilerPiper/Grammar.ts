
export class Grammar {
    input: string;
    m: Map<string, RegExp>;
    constructor(input: string) {
        this.input = input;
        this.m = new Map();
        let inputSplit = this.input.split("\n");

        for (let i = 0; i < inputSplit.length - 1; i++) {

            let split = inputSplit[i].split(" -> ");

            if (split.length == 2) {
                let id = split[0];
                let reg = split[1];

                if (id != "") {
                    if (!this.m.has(id)) {
                        if (reg != "") {
                            try {
                                let r = new RegExp(reg);
                                this.m.set(id, r);
                            } catch{
                                throw new Error();
                            }
                        } else {
                            throw new Error();
                        }
                    } else {
                        throw new Error();
                    }
                }
            } else {
                throw new Error();
            }
        }


        console.log(this.m);

    }
}