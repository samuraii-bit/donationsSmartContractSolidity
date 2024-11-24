import { ethers } from "hardhat";
import readline from "readline-sync";
import {contractAddress} from '../addresses.json';

async function main() {
    let amount: number;

    while (true) {
        amount = Number(readline.question("Please enter the donation amount: "));

        if (amount > 0) {
            break;
        } else {
            console.log("An invalid amount has been entered. Please, try again.");
        }
    }

    const Donations = await ethers.getContractAt("Donations", contractAddress);
    const users = await ethers.getSigners();

    const tx = await Donations.connect(users[1]).donate({ value: amount });
    await tx.wait(1);

    console.log(`Donation of ${ethers.formatEther(amount)} ETH from ${users[1].address} completed.`);
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});