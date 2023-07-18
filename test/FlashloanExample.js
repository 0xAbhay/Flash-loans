const {expect ,assert} = require("chai");
const hre  = require("hardhat");

const {DAI, DAI_WHALE, POOL_ADDRESS_AAVE} = require("../config");

describe("Flash Loans", function(){
    it("Should take a flash loan and be able to return it", async function(){
        const FlashLoanExample = await hre.ethers.getContractFactory("FlashLoanExample");

        // deploy our flash loan contract
        const FlashLoanexample = await FlashLoanExample.deploy(
            // addr of the AAVe pool
            POOL_ADDRESS_AAVE
        );
        await FlashLoanexample.waitForDeployment();

        //fetch dai smart contract
        const token = await hre.ethers.getContractFactory("IERC20",DAI);

        // move 2000 dai fro  DAI_whale to our contract by impersonating them
        const BALANCE_AMOUNT_DAI = hre.ethers.parseEther("2000");
        const signer = await ethers.getImpersonatedSigner(DAI_WHALE);
        await token
          .connect(signer)
          .transfer(FlashLoanexample.target, BALANCE_AMOUNT_DAI); // Sends our contract 2000 DAI from the DAI_WHALE
    
        // Request and execute a flash loan of 10,000 DAI from Aave
        const txn = await FlashLoanexample.createFlashLoan(DAI, 10000);
        await txn.wait();
    
        // By this point, we should have executed the flash loan and paid back (10,000 + premium) DAI to Aave
        // Let's check our contract's remaining DAI balance to see how much it has left
        const remainingBalance = await token.balanceOf(FlashLoanexample.target);
    
        // Our remaining balance should be <2000 DAI we originally had, because we had to pay the premium
        expect(remainingBalance).to.lessThan(BALANCE_AMOUNT_DAI);
      });
    });
