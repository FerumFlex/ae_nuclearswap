const HTLC_ERC20 = artifacts.require("HTLC_ERC20");

contract('HTLC_ERC20', () => {
  it('should read newly written values', async() => {
    const htlcErc20Instance = await HTLC_ERC20.deployed();
    // var value = (await simpleStorageInstance.read.call()).toNumber();

    // assert.equal(value, 0, "0 wasn't the initial value");

    // await simpleStorageInstance.write(1);
    // value = (await simpleStorageInstance.read.call()).toNumber();
    // assert.equal(value, 1, "1 was not written");

    // await simpleStorageInstance.write(2);
    // value = (await simpleStorageInstance.read.call()).toNumber();
    // assert.equal(value, 2, "2 was not written");
  });
});
