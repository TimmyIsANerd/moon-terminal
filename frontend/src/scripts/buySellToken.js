const hre = require("hardhat");
const { ethers } = require("hardhat");

async function swapToken() {
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  const tokenLaunchpadAddress = "0x9c670237cfdE371eb6b2C250637d0a13A8b7a281"; // Add your deployed TokenLaunchpad address here
  const tokenAddress = "0x88A6B81538b55090EC936Cf2c89C86e78b0794a9"; // Add your deployed token address here

  const TokenLaunchpad = await ethers.getContractFactory("TokenLaunchpad");
  const tokenLaunchpad = TokenLaunchpad.attach(tokenLaunchpadAddress);

  // Show token price
  let price = await tokenLaunchpad.getTokenPrice(tokenAddress);
  console.log(`Token price: ${ethers.formatEther(price)} ETH`);

  // Buy tokens
  const buyAmount = 100n;
  console.log("buyAmount", buyAmount);
  const buyValue = price * ethers.BigInt(buyAmount);
  const buyTx = await tokenLaunchpad.buyToken(tokenAddress, buyAmount, {
    value: buyValue,
  });
  await buyTx.wait();
  console.log(`Bought ${ethers.formatUnits(buyAmount, 18)} tokens`);

  // Show token price after buying
  let price1 = await tokenLaunchpad.getTokenPrice(tokenAddress);
  console.log(`Token price after buying: ${ethers.formatEther(price1)} ETH`);

  // Sell tokens
  const sellAmount = 1n;
  const sellTx = await tokenLaunchpad.sellToken(tokenAddress, sellAmount);
  await sellTx.wait();
  console.log(`Sold ${ethers.formatUnits(sellAmount, 18)} tokens`);

  // Show token price after selling
  let price2 = await tokenLaunchpad.getTokenPrice(tokenAddress);
  console.log(`Token price after selling: ${ethers.formatEther(price2)} ETH`);
}

module.exports = swapToken;
