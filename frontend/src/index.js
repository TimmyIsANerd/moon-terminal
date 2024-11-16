import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Exchange from "./pages/Exchange";
import Create from "./pages/Create";
import { createWeb3Modal, defaultConfig } from "@web3modal/ethers/react";
import Porfile from "./pages/Porfile";
import Feed from "./pages/Feed";

// 1. Get projectId
const projectId = "evmeme";

// 2. Set chains
const sepolia = {
  chainId: 11155111,
  name: "Sepolia Testnet",
  currency: "SepoliaETH",
  explorerUrl: "https://sepolia.etherscan.io/",
  rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/xANWTQeBRNw4PeeB59zfpVZHP2xNTq8z`,
};

const holesky = {
  chainId: 17000,
  name: "Holesky Testnet",
  currency: "ETH",
  explorerUrl: "https://holesky.etherscan.io/",
  rpcUrl: "https://ethereum-holesky-rpc.publicnode.com",
};

const flowTestnet = {
  chainId: 545,
  name: "Flow EVM Testnet",
  currency: "FLOW",
  explorerUrl: "https://evm-testnet.flowscan.io",
  rpcUrl: "https://testnet.evm.nodes.onflow.org",
};

const neonDevnet = {
  chainId: 245022926,
  name: "Neon EVM Devnet",
  currency: "NEON",
  explorerUrl: "https://devnet.neonscan.org",
  rpcUrl: "https://devnet.neonevm.org",
};

const morphHolesky = {
  chainId: 2810,
  name: "Morph Holesky Testnet",
  currency: "ETH",
  explorerUrl: "https://explorer-holesky.morphl2.io",
  rpcUrl: "https://rpc-quicknode-holesky.morphl2.io",
};

const incoTestnet = {
  chainId: 21097,
  name: "Inco Testnet",
  currency: "INCO",
  explorerUrl: "https://explorer.rivest.inco.org",
  rpcUrl: "https://validator.rivest.inco.org",
};

const rootstockTestnet = {
  chainId: 31,
  name: "Rootstock Testnet",
  currency: "RBTC",
  explorerUrl: "https://explorer.testnet.rootstock.io",
  rpcUrl: "https://public-node.testnet.rsk.co",
};

// 3. Create a metadata object
const metadata = {
  name: "EVMeme",
  description: "EVMeme",
  url: "https://evmeme.com",
  icons: ["https://avatars.mywebsite.com/"],
};

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  defaultChainId: 11155111, // Sepolia as default
});

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [
    sepolia,
    holesky,
    flowTestnet,
    neonDevnet,
    morphHolesky,
    incoTestnet,
    rootstockTestnet
  ],
  projectId,
  enableAnalytics: true,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="exchange/:address" element={<Exchange />} />
        <Route path="create" element={<Create />} />
        <Route path="p/:address" element={<Porfile />} />
        <Route path="feed" element={<Feed />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
