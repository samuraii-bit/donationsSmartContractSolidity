import { ethers } from "hardhat";
import {contractAddress} from '../addresses.json';
import readline from "readline-sync";

async function main() {
    const Donations = await ethers.getContractAt("Donations", contractAddress);
    let donatorAddress :string;
    
    while (true) {
        donatorAddress = readline.question("Please enter Ethereum-address of donator: ");
        
        if (ethers.isAddress(donatorAddress)) {
            break;
        } else {
            console.log("An invalid address has been entered. Please, try again.");
        }
    }

    const donationsSum = await Donations.getDonationsInfo(donatorAddress);
    console.log(`Sum of donations from ${donatorAddress}: ${ethers.formatEther(donationsSum)} ETH`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});