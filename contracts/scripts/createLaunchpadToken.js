const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);

  const tokenLaunchpadAddress = "0x6D9D03e324aCB65736816478fB14c5186F29E678";
  const TokenLaunchpad = await ethers.getContractFactory("TokenLaunchpad");
  const tokenLaunchpad = TokenLaunchpad.attach(tokenLaunchpadAddress);

  // Fixed token name and symbol
  const name = "TestMEME";
  const symbol = "MEME";

  const tx = await tokenLaunchpad.createToken(name, symbol);
  const receipt = await tx.wait();

  console.log("Transaction receipt:", receipt);

  const eventAbi = [
    "event TokenCreated(address indexed tokenAddress, string name, string symbol)",
  ];
  const iface = new ethers.Interface(eventAbi);

  let newTokenAddress;
  for (let log of receipt.logs) {
    try {
      const parsedLog = iface.parseLog(log);
      if (parsedLog.name === "TokenCreated") {
        newTokenAddress = parsedLog.args.tokenAddress;
        console.log("Token Address:", parsedLog.args.tokenAddress);
        console.log("Name:", parsedLog.args.name);
        console.log("Symbol:", parsedLog.args.symbol);
        break;
      }
    } catch (e) {
      // log not parsed
    }
  }

  if (newTokenAddress) {
    console.log("New token created at:", newTokenAddress);
  } else {
    console.error("TokenCreated event not found in receipt.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
