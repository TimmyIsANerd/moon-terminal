const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  const tokenLaunchpadAddress = "0x6D9D03e324aCB65736816478fB14c5186F29E678"; 
  const tokenAddress = "0x883c1dF4c8abB68FfbD40A922b0Cb5aB01065Fc8"; 

  const TokenLaunchpad = await ethers.getContractFactory("TokenLaunchpad");
  const tokenLaunchpad = TokenLaunchpad.attach(tokenLaunchpadAddress);

  // Show token price
  let price = await tokenLaunchpad.getTokenPrice(tokenAddress);
  console.log(`Token price: ${ethers.formatEther(price)} ETH`);

  // Buy tokens
  const buyAmount = 100n;
  console.log("buyAmount", buyAmount);
  const buyValue = price * BigInt(buyAmount);
  const buyTx = await tokenLaunchpad.buyToken(tokenAddress, buyAmount, {
    value: buyValue,
  });
  await buyTx.wait();
  console.log(`Bought ${ethers.formatUnits(buyAmount, 18)} tokens`);

  // Show token price after buying
  let price1 = await tokenLaunchpad.getTokenPrice(tokenAddress);
  console.log(`Token price after buying: ${ethers.formatEther(price1)} ETH`);

  /*
  // Sell tokens
  const sellAmount = 1n;
  const sellTx = await tokenLaunchpad.sellToken(tokenAddress, sellAmount);
  await sellTx.wait();
  console.log(`Sold ${ethers.formatUnits(sellAmount, 18)} tokens`);

  // Show token price after selling
  let price2 = await tokenLaunchpad.getTokenPrice(tokenAddress);
  console.log(`Token price after selling: ${ethers.formatEther(price2)} ETH`);
  */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
