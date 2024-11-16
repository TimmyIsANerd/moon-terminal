const hre = require("hardhat");

async function main() {
  // Compile the contract
  const TokenLaunchpad = await hre.ethers.getContractFactory("TokenLaunchpad");
  
  const tokenLaunchpad = await TokenLaunchpad.deploy();

  let tokenLaunchpadTx = await tokenLaunchpad.getAddress();
  console.log("tokenLaunchpad deployed to:", tokenLaunchpadTx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
