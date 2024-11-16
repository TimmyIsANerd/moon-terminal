require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    neonDevnet: {
      url: "https://devnet.neonevm.org",
      chainId: 245022926,
      accounts: [process.env.NEON_DEVNET_PRIVATE_KEY],
    },
    holesky: {
      url: "https://ethereum-holesky-rpc.publicnode.com/",
      chainId: 17000,
      accounts: [process.env.NEON_DEVNET_PRIVATE_KEY],
    },
    morphHolesky: {
      url: "https://rpc-quicknode-holesky.morphl2.io",
      chainId: 2810,
      accounts: [process.env.NEON_DEVNET_PRIVATE_KEY],
    },
    flowTestnet: {
      url: "https://testnet.evm.nodes.onflow.org",
      chainId: 545,
      accounts: [process.env.NEON_DEVNET_PRIVATE_KEY],
    },
    incoTestnet: {
      url: "https://validator.rivest.inco.org/",
      chainId: 21097,
      accounts: [process.env.NEON_DEVNET_PRIVATE_KEY],
    },
    rootstockTestnet: {
      url: "https://public-node.testnet.rsk.co",
      chainId: 31,
      accounts: [process.env.NEON_DEVNET_PRIVATE_KEY],
    }
  },

  etherscan: {
    apiKey: {
      'neonDevnet': process.env.NEON_DEVNET_API_KEY,
      'holesky': process.env.ETHERSCAN_API_KEY,
      'morphHolesky': process.env.MORPH_API_KEY,
      'flowTestnet': 'empty',
      'incoTestnet': 'empty',
      'rootstockTestnet': 'empty'
    },
    customChains: [
      {
        network: "neonDevnet",
        chainId: 245022926,
        urls: {
          apiURL: "https://neon-devnet.blockscout.com/api",
          browserURL: "https://neon-devnet.blockscout.com"
        }
      },
      {
        network: "holesky",
        chainId: 17000,
        urls: {
          apiURL: "https://api-holesky.etherscan.io/api",
          browserURL: "https://holesky.etherscan.io"
        }
      },
      {
        network: "morphHolesky",
        chainId: 2810,
        urls: {
          apiURL: "https://explorer-holesky.morphl2.io/api",
          browserURL: "https://explorer-holesky.morphl2.io"
        }
      },
      {
        network: "flowTestnet",
        chainId: 545,
        urls: {
          apiURL: "https://evm-testnet.flowscan.io/api",
          browserURL: "https://evm-testnet.flowscan.io"
        }
      },
      {
        network: "incoTestnet",
        chainId: 21097,
        urls: {
          apiURL: "https://api.explorer.rivest.inco.org/api",
          browserURL: "https://explorer.rivest.inco.org"
        }
      },
      {
        network: "rootstockTestnet",
        chainId: 31,
        urls: {
          apiURL: "https://explorer.testnet.rootstock.io/api",
          browserURL: "https://explorer.testnet.rootstock.io"
        }
      }
    ]
  }

};
