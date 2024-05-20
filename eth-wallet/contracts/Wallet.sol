// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Wallet {
    address public owner;

    event EtherSent(address indexed from, address indexed to, uint256 value);

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) public {
        require(msg.sender == owner, "Only the owner can call this function");
        owner = newOwner;
    }

    function sendEther(address payable _to) public payable {
        require(msg.value > 0, "Are You Kidding?!, Put some Ethereum to transfer");
        require(_to != address(0), "Invalid recipient address");

        _to.transfer(msg.value);
        emit EtherSent(msg.sender, _to, msg.value);
    }

    receive() external payable {}
}
