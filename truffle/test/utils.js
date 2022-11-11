const crypto = require('crypto');


function delay(ms) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

function sha256hash(str_or_buffer) {
  return "0x" + sha256(str_or_buffer).digest("hex");
}

function sha256(str_or_buffer) {
  return crypto.createHash('sha256').update(str_or_buffer);
}

function encodePacked(web3, ...args) {
  return Buffer.from(
    web3.utils.encodePacked(...args).substr(2),
    "hex"
  )
}

function getSwapId(web3, fromToken, toToken, sender, recipient, amount, nonce) {
  let result = sha256hash(
    encodePacked(
      web3,
      {value: fromToken, type: "address"},
      {value: sha256hash(encodePacked(web3, {value: toToken, type: "string"})), type: "bytes32"},
      {value: sender, type: "address"},
      {value: sha256hash(encodePacked(web3, {value: recipient, type: "string"})), type: "bytes32"},
      {value: sha256hash(encodePacked(web3, {value: amount.toString(), type: "string"})), type: "bytes32"},
      {value: sha256hash(encodePacked(web3, {value: nonce.toString(), type: "string"})), type: "bytes32"}
    )
  );
  return result;
}

async function getSignature(web3, account, swapId) {
  let message = swapId;
  let hash = await web3.eth.personal.sign(message, account);
  return hash;
}

module.exports = {
  delay,
  sha256hash,
  sha256,
  encodePacked,
  getSwapId,
  getSignature
};
