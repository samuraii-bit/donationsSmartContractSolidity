import { writeFileSync } from 'fs';
import { ethers } from "hardhat";

async function main() {
    const Donations = await ethers.getContractFactory("Donations");
    const donations = await Donations.deploy();

    await donations.waitForDeployment();

    console.log(`Contract deployed to: ${donations.target}`);
    const addresses = {contractAddress: donations.target, ownerAddress: donations.deploymentTransaction()?.from};
    writeFileSync("addresses.json", JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});