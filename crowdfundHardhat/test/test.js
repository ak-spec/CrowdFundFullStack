const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("CrowdFundManager", function () {
  let crowdFundManager;
  let owner;
  let funder;

  before(async function () {
    const CrowdFundManager = await ethers.getContractFactory("CrowdFundManager");
    [owner, funder] = await ethers.getSigners();

    crowdFundManager = await CrowdFundManager.deploy();
    await crowdFundManager.waitForDeployment();
  });

  describe("Campaign Creation and Funding", function () {
    it("should create a new campaign", async function () {
      await crowdFundManager.connect(owner).launch("Campaign1", "test", 3600, 100);
      const campaign = await crowdFundManager.campaigns(0);

      expect(campaign.owner).to.equal(owner.address);
      expect(campaign.targetAmt).to.equal(100);
      expect(campaign.currAmt).to.equal(0);
      expect(campaign.status).to.equal(0);
    });

    it("should fund the campaign", async function () {
      await crowdFundManager.connect(funder).fund(0, { value: 50 });
      const campaign = await crowdFundManager.campaigns(0);

      expect(campaign.currAmt).to.equal(50);
      expect(await crowdFundManager.fundersToAmt(0, funder.address)).to.equal(50);
    });
  });

  describe("Withdrawal from successful campaign and Refund from failed campaign", function () {
    it("should withdraw funds from the successful campaign", async function () {
        // Launch a campaign
        await crowdFundManager.connect(owner).launch("Campaign2", "test", 3600, ethers.parseEther("100"));
    
        // Fund the campaign with the target amount
        await crowdFundManager.connect(funder).fund(1, { value: ethers.parseEther("100") });
    
        // Fast-forward the time to make the campaign end
        await ethers.provider.send("evm_increaseTime", [4000]);
        await ethers.provider.send("evm_mine");
    
        const initialBalance = await ethers.provider.getBalance(owner.address);
        console.log(ethers.formatEther(initialBalance))
        await crowdFundManager.connect(owner).withdraw(1);
        const finalBalance = await ethers.provider.getBalance(owner.address);
        console.log(ethers.formatEther(finalBalance))
    
        const campaign = await crowdFundManager.campaigns(1);
        expect(campaign.currAmt).to.equal(0);
        expect(campaign.status).to.equal(2);
      });
    

    it("should refund funds from the failed campaign", async function () {
      await crowdFundManager.connect(owner).launch("Campaign3", "test", 3600, ethers.parseEther("100"));
      await crowdFundManager.connect(funder).fund(2, { value: ethers.parseEther("50") });
      
      // Fast-forward the time to make the campaign end
      await ethers.provider.send("evm_increaseTime", [4000]);
      await ethers.provider.send("evm_mine");

      const initialBalance = await ethers.provider.getBalance(funder.address);
      console.log(ethers.formatEther(initialBalance))
      await crowdFundManager.withdraw(2);
      await crowdFundManager.connect(funder).refund(2);
      const finalBalance = await ethers.provider.getBalance(funder.address);
      console.log(ethers.formatEther(finalBalance))

      const campaign = await crowdFundManager.campaigns(2);
      expect(campaign.currAmt).to.equal(0);
      expect(campaign.status).to.equal(3);
    });
  });

  describe("Campaign Cancellation and Deletion", function () {
    it("should cancel the campaign", async function () {
      await crowdFundManager.launch("Campaign4", "test", 3600, ethers.parseEther("100"));

      const initialStatus = (await crowdFundManager.campaigns(3)).status;
      await crowdFundManager.connect(owner).cancelCampaign(3);
      const finalStatus = (await crowdFundManager.campaigns(3)).status;

      expect(initialStatus).to.equal(0);
      expect(finalStatus).to.equal(1);
    });

    it("should refund funds after cancelling campaign", async function () {
      await crowdFundManager.connect(owner).launch("Campaign5", "test", 3600, ethers.parseEther("100"));
      await crowdFundManager.connect(funder).fund(4, { value: ethers.parseEther("50") });
      
      await crowdFundManager.connect(owner).cancelCampaign(4);
      
      const initialBalance = await ethers.provider.getBalance(funder.address);
      const convertedInitialBalance = Math.floor(Number(ethers.formatEther(initialBalance)));
      
      await crowdFundManager.connect(funder).refund(4);
      const finalBalance = await ethers.provider.getBalance(funder.address);
      const convertedfinalBalance = Math.floor(Number(ethers.formatEther(finalBalance)));

      expect(convertedfinalBalance - convertedInitialBalance).to.equal(50);
    })


    it("should not delete the campaign if it is ongoing", async function () {
      await crowdFundManager.connect(owner).launch("Campaign6", "test", 3600, ethers.parseEther("100"));
      await crowdFundManager.connect(funder).fund(5, { value: ethers.parseEther("50") })
      await expect(crowdFundManager.deleteCampaign(5)).to.be.revertedWith("Invalid campaign or cannot delete ongoing campaign!");
    });

    it("should not delete campaign if refund is incomplete after the campaign failed", async function () {
      await crowdFundManager.connect(owner).launch("Campaign7", "test", 3600, ethers.parseEther("100"));
      await crowdFundManager.connect(funder).fund(6, { value: ethers.parseEther("50") })

      // Fast-forward the time to make the campaign end
      await ethers.provider.send("evm_increaseTime", [4000]);
      await ethers.provider.send("evm_mine");
      await crowdFundManager.withdraw(6);
      await expect(crowdFundManager.deleteCampaign(6)).to.be.revertedWith("refund to contributors not complete/funds not withdrawn!");
    })

    it("should delete the campaign if all conditions for deletion are met", async () => {
      await crowdFundManager.connect(owner).launch("Campaign8", "test", 3600, ethers.parseEther("100"));
      await crowdFundManager.connect(funder).fund(7, { value: ethers.parseEther("110") });

      const numOfDeletedCampaignsBefore = await crowdFundManager.noOfDeletedCampaigns();
      // Fast-forward the time to make the campaign end
      await ethers.provider.send("evm_increaseTime", [4000]);
      await ethers.provider.send("evm_mine");
      await crowdFundManager.withdraw(7);
      await crowdFundManager.connect(owner).deleteCampaign(7);

      const numOfDeletedCampaignsAfter = await crowdFundManager.noOfDeletedCampaigns();

      expect(numOfDeletedCampaignsBefore).to.equal(0);
      expect(numOfDeletedCampaignsAfter).to.equal(1);
    })
  });

  describe("Get All campaigns and test fallback/receive", () => {
    it("should fetch all valid campaigns", async () => {
      const allCampaigns = await crowdFundManager.getCampaigns();
      expect(allCampaigns).to.have.lengthOf(7);
    })
    it("should invoke fallback function", async () => {
      const bef = await ethers.provider.getBalance(crowdFundManager.getAddress());
      const tx_res = await funder.sendTransaction({to:"0x5fbdb2315678afecb367f032d93f642f64180aa3", data:"0x", value: 1000000000});
      await tx_res.wait(1)
      const aft = await ethers.provider.getBalance(crowdFundManager.getAddress());
      expect(ethers.toNumber(bef)).to.not.equal(ethers.toNumber(aft))

    })
    it("should invoke receive function", async () => {
      const bef = await ethers.provider.getBalance(crowdFundManager.getAddress());
      const tx_res = await funder.sendTransaction({to:"0x5fbdb2315678afecb367f032d93f642f64180aa3", value: 1000000000});
      await tx_res.wait(1)
      const aft = await ethers.provider.getBalance(crowdFundManager.getAddress());
      expect(ethers.toNumber(bef)).to.not.equal(ethers.toNumber(aft))

    })
  })
});
