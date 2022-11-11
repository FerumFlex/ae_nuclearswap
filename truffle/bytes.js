let address = "0x9a63911A6495D76b36a94025c16847E4E6236b7A";

let buf = Buffer.from(address.substr(2), "hex");
console.log(`Hex:, 0x${buf.toString("hex")}`);

let parts = [];
for (let elem of buf) {
    parts.push(elem.toString());
}

let str = parts.map(x => `${x}`).join(",")

console.log("[" + str + "]");