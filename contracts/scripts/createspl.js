const hre = require("hardhat");
const { ethers } = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  const tokenLaunchpadAddress = "0xDE9eBaE95F61ef8eA5bd1C16067d652C885cA373"; // Add your deployed TokenLaunchpad address here
  const tokenAddress = "0xa0814e3c8038952405DFA841A96662cCfA3437E9"; // Add your deployed token address here

  const TokenLaunchpad = await ethers.getContractFactory("TokenLaunchpad");
  const tokenLaunchpad = TokenLaunchpad.attach(tokenLaunchpadAddress);

  // Show token price
  let price = await tokenLaunchpad.getTokenPrice(tokenAddress);
  console.log(`Token price: ${ethers.formatEther(price)} ETH`);

  // Buy tokens
  const buyAmount = ethers.utils.parseUnits("100", 18); // Amount to buy: 100 tokens
  const buyValue = price * buyAmount;
  const buyTx = await tokenLaunchpad.buyToken(tokenAddress, buyAmount, {
    value: buyValue,
  });
  await buyTx.wait();
  console.log(`Bought ${ethers.formatUnits(buyAmount, 18)} tokens`);

  // Show token price after buying
  price = await tokenLaunchpad.getTokenPrice(tokenAddress);
  console.log(`Token price after buying: ${ethers.formatEther(price)} ETH`);

  // Sell tokens
  const sellAmount = ethers.parseUnits("50", 18); // Amount to sell: 50 tokens
  const sellTx = await tokenLaunchpad.sellToken(tokenAddress, sellAmount);
  await sellTx.wait();
  console.log(`Sold ${ethers.formatUnits(sellAmount, 18)} tokens`);

  // Show token price after selling
  price = await tokenLaunchpad.getTokenPrice(tokenAddress);
  console.log(`Token price after selling: ${ethers.formatEther(price)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
