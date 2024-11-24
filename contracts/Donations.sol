// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract Donations {
    address private owner;
    mapping (address => uint) private donations; 
    address[] private donators;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(
            msg.sender == owner,
            "Only owner can call this function."
        );
        _;
    }

    modifier notEmpty{
        require(
            msg.value != 0,
            "The amount must not be zero."
        );
        _;
    }

    receive() external payable {
        revert("Plese use donate function to make donations.");
    }

    function donate() external payable notEmpty {
        if (donations[msg.sender] == 0) // Проверка, что текущий sender ещё не донатил в контракт 
        { 
            donators.push(msg.sender);
        }

        donations[msg.sender] += msg.value;
    }

    function withdraw(address payable reciever, uint sum) external onlyOwner {
        require(
            reciever != address(0), 
            "Invalid address."
        );
        reciever.transfer(sum);
    }

    function getDonationsInfo(address donator) external view returns(uint){
        return donations[donator];
    }
    

    function getDonatorsInfo() external view returns(address[] memory) {
        return donators;
    }
}