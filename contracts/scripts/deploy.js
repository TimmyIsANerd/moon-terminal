const hre = require("hardhat");

async function main() {
  // Compile the contract
  const ERC20ForSplFactory = await hre.ethers.getContractFactory(
    "ERC20ForSplFactory"
  );
  const erc20ForSplFactory = await ERC20ForSplFactory.deploy();

  let erc20 = await erc20ForSplFactory.getAddress();
  console.log("ERC20ForSplFactory deployed to:", erc20);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
