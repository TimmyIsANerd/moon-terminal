const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const splTokenAddress = "0xcf07BA0501A5187756B0bB72F3f8E53EBe3C97ef";
  const mintAddress = "0x42096D2046B352ae8f16C6eD13E9cB34508Faf45";
  const mintAmount = 1000000000000000000000000000000n;


  const SPLToken = await ethers.getContractAt(
    "ERC20ForSplMintable",
    splTokenAddress
  );

  const tx = await SPLToken.mint(mintAddress, mintAmount);

  console.log(tx);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
