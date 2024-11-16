const hre = require("hardhat");

async function main() {
  // Compile the contract
  const TokenLaunchpad = await hre.ethers.getContractFactory("TokenLaunchpad");
  const devnet = "0xF6b17787154C418d5773Ea22Afc87A95CAA3e957";
  const tokenLaunchpad = await TokenLaunchpad.deploy(devnet);

  let tokenLaunchpadTx = await tokenLaunchpad.getAddress();
  console.log("tokenLaunchpad deployed to:", tokenLaunchpadTx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
