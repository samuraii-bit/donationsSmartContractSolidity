import {loadFixture, ethers, expect} from "./setup";

describe("Testing Donations", function() {
    async function deploy() {
        const users = await ethers.getSigners();
    
        const Factory = await ethers.getContractFactory("Donations");
        const donations = await Factory.deploy();
        await donations.waitForDeployment();

        return {users, donations};
    }

    it("Deployment test", async function(){
        const {donations} = await loadFixture(deploy);
        expect(donations.target).to.be.properAddress;
    });

    it("receive function test", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum = 1000;

        await expect(users[1].sendTransaction({
            to: donations,
            value: sum
        })).to.be.revertedWith("Plese use donate function to make donations.");
    });

    it("donate function test: user[1] balance change", async function () {
        const {users, donations} = await loadFixture(deploy);
        const sum = 1000;
        const tx = await donations.connect(users[1]).donate({value: sum});

        await expect(tx).to.changeEtherBalance(users[1], -sum);
    });

    it("donate function test: contract balance change", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum = 1000;
        const tx = await donations.connect(users[1]).donate({value: sum});

        await expect(tx).to.changeEtherBalance(donations, sum);
    });

    it("donate function test: 0 sum donate", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum = 0;
        const tx = await donations.connect(users[1]);
        
        await expect(tx.donate({value: sum})).to.be.revertedWith("The amount must not be zero.");
    });

    it("donate function test: big donate", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum = 1000000000000000;
        const tx = await donations.connect(users[1]).donate({value: sum});
        
        await expect(tx).to.changeEtherBalance(donations, sum);
    });

    it("donate function test: negative number", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum = -1;
        const tx = await donations.connect(users[1]);
        
        await expect(tx.donate({value: sum})).to.be.rejected;
    });

    it("donate function test: big negative number", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum = -1000000000000000;
        const tx = await donations.connect(users[1]);
        
        await expect(tx.donate({value: sum})).to.be.rejected;
    });

    it("donate function test: the user has already donated", async function (){
        const {users, donations} = await loadFixture(deploy);
        const sum1 = 1000;
        const sum2 = 2000;
        await donations.connect(users[1]).donate({value: sum1});
        await donations.connect(users[1]).donate({value: sum2});
        await donations.connect(users[1]).donate({value: sum1 + sum2});
        const donators = await donations.getDonatorsInfo();
        
        await expect(donators.length).to.be.eq(1);
    });

    it("withdraw function test: withdraw to users[2] address", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum = 1000;
        await donations.connect(users[1]).donate({value: sum});
        const tx = await donations.connect(users[0]).withdraw(users[2].address, sum);

        await expect(tx).changeEtherBalance(users[2], sum);
    });

    it("withdraw function test: withdraw an amount greater than the balance of the contract", async function name() {
        const {users, donations} = await loadFixture(deploy);
        const sum = 1000;
        await donations.connect(users[1]).donate({value: sum});
        const tx = await donations.connect(users[0]);

        await expect(tx.withdraw(users[0].address, sum + 1)).to.be.rejected;
    });

    it("withdraw function test: calling a function without owner's rights", async function name() {
        const {users, donations} = await loadFixture(deploy);
        const sum = 1000;
        const tx = await donations.connect(users[1]);
        await tx.donate({value: sum});

        await expect(tx.withdraw(users[1].address, sum)).to.be.revertedWith("Only owner can call this function.");
    });

    it("withdraw function test: calling a function with NULL address", async function name() {
        const {users, donations} = await loadFixture(deploy);
        const sum = 1000;
        const tx = await donations.connect(users[0]);
        await tx.donate({value: sum});

        await expect(tx.withdraw(ethers.ZeroAddress, sum)).to.be.revertedWith("Invalid address.");
    });

    it("withdraw function test: negative number", async function name() {
        const {users, donations} = await loadFixture(deploy);
        const sum = 1000;
        const tx = await donations.connect(users[0]);
        await tx.donate({value: sum});

        await expect(tx.withdraw(users[0].address, -1)).to.be.rejected;
    });

    it("withdraw function test: big negative number", async function name() {
        const {users, donations} = await loadFixture(deploy);
        const sum = 1000;
        const tx = await donations.connect(users[0]);
        await tx.donate({value: sum});

        await expect(tx.withdraw(users[0].address, -1000000000000000)).to.be.rejected;
    });

    it("withdraw function test: withdraw zero", async function name() {
        const {users, donations} = await loadFixture(deploy);
        const sum = 1000;
        const tx = await donations.connect(users[0]);
        await tx.donate({value: sum});

        await expect(tx.withdraw(users[0].address, 0)).to.changeEtherBalance(users[0].address, 0);
        await expect(tx.withdraw(users[0].address, 0)).to.changeEtherBalance(donations, 0);
    });

    it("getDonationsInfo function test: 1 user donates many times", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum1 = 1000;
        const sum2 = 2000;
        const sum3 = 5000;
        const checkSum  = sum1 + sum2 + sum3;
        await donations.connect(users[1]).donate({value: sum1});
        await donations.connect(users[1]).donate({value: sum2});
        await donations.connect(users[1]).donate({value: sum3});

        const sum = await donations.getDonationsInfo(users[1].address);
        expect(sum).to.be.eq(checkSum);
    });

    it("getDonationsInfo function test: several users donate many time", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum1 = 1000;
        const sum2 = 2000;
        const sum3 = 5000;
        await donations.connect(users[1]).donate({value: sum1});
        await donations.connect(users[2]).donate({value: sum2});
        await donations.connect(users[3]).donate({value: sum3});

        const checkSum1 = await donations.getDonationsInfo(users[1].address);
        expect(checkSum1).to.be.eq(sum1);
        const checkSum2 = await donations.getDonationsInfo(users[2].address);
        expect(checkSum2).to.be.eq(sum2);
        const checkSum3 = await donations.getDonationsInfo(users[3].address);
        expect(checkSum3).to.be.eq(sum3);
    });

    it("getDonationsInfo function test: calling a function with NULL address", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum1 = 1000;
        await donations.connect(users[1]).donate({value: sum1});


        const sum = await donations.getDonationsInfo(ethers.ZeroAddress);
        expect(sum).to.be.eq(0);
    });

    it("getDonationsInfo function test: calling a function with 0 donates address", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum1 = 1000;
        await donations.connect(users[1]).donate({value: sum1});

        expect(await donations.getDonationsInfo(ethers.resolveAddress("0x6B175474E89094C44Da98b954EedeAC495271d0F"))).to.be.eq(0);
    });

    it("getDonatorsInfo function test: check number of donators", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum1 = 1000;
        const sum2 = 2000;
        await donations.connect(users[1]).donate({value: sum1});
        await donations.connect(users[1]).donate({value: sum1});
        await donations.connect(users[2]).donate({value: sum2});
        await donations.connect(users[2]).donate({value: sum2});
        await donations.connect(users[3]).donate({value: sum1 + sum2});
        const donators = await donations.getDonatorsInfo();
        
        await expect(donators.length).to.be.eq(3);
    });

    it("getDonatorsInfo function test: many users donate 1 time, check donators addresses", async function(){
        const {users, donations} = await loadFixture(deploy);
        const sum1 = 1000;
        const sum2 = 2000;
        await donations.connect(users[1]).donate({value: sum1});
        await donations.connect(users[2]).donate({value: sum2});
        await donations.connect(users[2]).donate({value: sum2 * 2});
        await donations.connect(users[1]).donate({value: sum1 * sum2});
        await donations.connect(users[3]).donate({value: sum1});
        await donations.connect(users[3]).donate({value: sum1 * sum1});
        await donations.connect(users[1]).donate({value: sum2});
        await donations.connect(users[2]).donate({value: sum2 * sum2});
        await donations.connect(users[3]).donate({value: sum1 + sum2});
        const donators = await donations.getDonatorsInfo();

        const checkDonators = [users[1].address, users[2].address, users[3].address]
        
        await expect(donators).to.be.eql(checkDonators);
    });

});