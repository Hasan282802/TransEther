const Wallet = artifacts.require("Wallet");

contract("Wallet", accounts => {
  it("Deploying the Contract and Setting the Owner", async () => {
    const walletInstance = await Wallet.deployed();
    const owner = await walletInstance.owner.call();
    assert.equal(owner, accounts[0], "Owner is not set correctly");
  });

  it("Transfering Ethereum", async () => {
    const walletInstance = await Wallet.deployed();
    const recipient = accounts[1];
    const amount = web3.utils.toWei("1", "ether");

    // Send ether
    await walletInstance.sendEther(recipient, { from: accounts[0], value: amount });

    // Check recipient balance
    const balance = await web3.eth.getBalance(recipient);
    assert(balance > 0, "Recipient did not receive ether");
  });

  it("Logging the Transactions", async () => {
    const walletInstance = await Wallet.deployed();
    const recipient = accounts[1];
    const amount = web3.utils.toWei("1", "ether");

    // Send ether
    const receipt = await walletInstance.sendEther(recipient, { from: accounts[0], value: amount });

    // Check event
    assert.equal(receipt.logs.length, 1, "Trigger one event");
    assert.equal(receipt.logs[0].event, "EtherSent", "Should be the EtherSent event");
    assert.equal(receipt.logs[0].args.from, accounts[0], "Log the sender correctly");
    assert.equal(receipt.logs[0].args.to, recipient, "Log the recipient correctly");
    assert.equal(receipt.logs[0].args.value.toString(), amount, "Log the amount correctly");
  });
});
