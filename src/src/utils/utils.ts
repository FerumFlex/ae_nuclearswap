function pad(n: string, width: number, z = "0") {
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function hexdump(buf: ArrayBuffer) {
  let view = new Uint8Array(buf);
  let hex = Array.from(view).map((v) => pad(v.toString(16), 2));
  return hex.join(" ");
}

export function makeid(length: number) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
