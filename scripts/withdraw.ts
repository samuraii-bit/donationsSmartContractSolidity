import { ethers } from "hardhat";
import {contractAddress, ownerAddress} from '../addresses.json';
import readline from "readline-sync";

async function main() {
    const owner = await ethers.getSigner(ownerAddress);
    const Donations = await ethers.getContractAt("Donations", contractAddress);

    let recipient : string;
    let amount : number;

    while (true) {
        recipient = readline.question("Please enter Ethereum-address of recipient: ");
        
        if (ethers.isAddress(recipient)) {
            break;
        } else {
            console.log("An invalid address has been entered. Please, try again.");
        }
    }

    while (true) {
        amount = Number(readline.question("Please enter the amount: "));

        if (amount > 0) {
            break;
        } else {
            console.log("An invalid amount has been entered. Please, try again.");
        }
    }

    const tx = await Donations.connect(owner).withdraw(recipient, amount);
    await tx.wait(1);

    console.log(`Withdrawn ${ethers.formatEther(amount)} ETH to ${recipient}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
