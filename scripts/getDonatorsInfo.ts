import { ethers } from "hardhat";
import {contractAddress} from '../addresses.json';

async function main() {
    const Donations = await ethers.getContractAt("Donations", contractAddress);

    const donators = await Donations.getDonatorsInfo();

    console.log("donators:", donators);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});