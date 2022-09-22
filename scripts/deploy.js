const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
  const tokenContract = await ethers.getContractFactory("Dai");

  const deployedTokenContract = await tokenContract.deploy();
  await deployedTokenContract.deployed();

  console.log("Token Contract Address:", deployedTokenContract.address);

  const tokenContractAddress = deployedTokenContract.address;

  const bearBetContract = await ethers.getContractFactory("superBetContract");

  const deployedBearBetContract = await bearBetContract.deploy(
    tokenContractAddress,
    30
  );

  await deployedBearBetContract.deployed();

  console.log("BearBet Contract Address:", deployedBearBetContract.address);

  console.log("Sleeping.....");
  await sleep(20000);

  await hre.run("verify:verify", {
    address: deployedBearBetContract.address,
    constructorArguments: [tokenContractAddress, 30],
  });

  console.log("Sleeping.....");
  await sleep(20000);

  await hre.run("verify:verify", {
    address: deployedTokenContract.address,
    constructorArguments: [],
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
