import { useState, useEffect } from "react";
import React from "react";
import { getContractABI } from '../utils/getContractABI';
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, Interface } from "ethers";

// Kontrat adreslerini bir obje olarak tanımlayalım
const CONTRACT_ADDRESSES = {
  11155111: {  // Sepolia
    tokenLaunchpad: "0x6D9D03e324aCB65736816478fB14c5186F29E678",
  },
  245022926: { // Neon Devnet
    tokenLaunchpad: "0xF4804d1e6D2504ce37046E971dfFC7F783Fa3070",
  },
  545: {      // Flow Testnet
    tokenLaunchpad: "0x6D9D03e324aCB65736816478fB14c5186F29E678",
  },
  2810: {     // Morph Holesky
    tokenLaunchpad: "0x6D9D03e324aCB65736816478fB14c5186F29E678",
  },
  21097: {    // Inco Testnet
    tokenLaunchpad: "0x6D9D03e324aCB65736816478fB14c5186F29E678",
  },
  31: {       // Rootstock Testnet
    tokenLaunchpad: "0x6D9D03e324aCB65736816478fB14c5186F29E678",
  },
  17000: {    // Holesky
    tokenLaunchpad: "0x6D9D03e324aCB65736816478fB14c5186F29E678",
  }
};

// Add explorer URLs object
const BLOCK_EXPLORERS = {
  11155111: "https://sepolia.etherscan.io",  // Sepolia
  245022926: "https://neon-devnet.blockscout.com", // Neon Devnet
  545: "https://evm-testnet.flowscan.io", // Flow Testnet
  2810: "https://explorer.testnet.morphl2.io", // Morph Holesky
  21097: "https://explorer.rivest.inco.org", // Inco Testnet
  31: "https://explorer.testnet.rootstock.io", // Rootstock Testnet
  17000: "https://holesky.etherscan.io" // Holesky
};

const Create = () => {
  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    description: "",
    image: null,
    telegramLink: "",
    twitterLink: "",
    websiteLink: "",
    discordLink: "",
  });

  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    tokenAddress: '',
    transactionHash: '',
    blockNumber: '',
  });

  useEffect(() => {
    const initializeSigner = async () => {
      if (isConnected && walletProvider) {
        try {
          const provider = new BrowserProvider(walletProvider);
          const newSigner = await provider.getSigner();
          console.log("newSigner",newSigner);
          setSigner(newSigner);
        } catch (error) {
          console.error("Failed to initialize signer:", error);
        }
      }
    };

    initializeSigner();
  }, [isConnected, walletProvider]);

  useEffect(() => {
    if (signer && chainId) {
      initializeContract()
        .then(setContract)
        .catch(error => {
          console.error("Contract initialization failed:", error);
        });
    }
  }, [signer, chainId]);

  const initializeContract = async () => {
    try {
      const { abi, factoryAddress } = getContractABI(chainId);
      
      // For Neon network, use factory contract
      if (chainId === 245022926 || chainId === 245022934) {
        return new Contract(
          factoryAddress,
          abi,
          signer
        );
      }

      // For other networks, use regular token launchpad
      const tokenLaunchpadAddress = CONTRACT_ADDRESSES[chainId]?.tokenLaunchpad;
      if (!tokenLaunchpadAddress) {
        throw new Error("Contract address not found for this network");
      }

      return new Contract(
        tokenLaunchpadAddress,
        abi,
        signer
      );
    } catch (error) {
      console.error("Failed to initialize contract:", error);
      throw error;
    }
  };

  const createToken = async (name, symbol) => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      console.log("Creating token with params:", { name, symbol });
      console.log("Contract methods:", contract.interface.fragments);
      
      // Contract'ın createToken fonksiyonunu çağır
      const tx = await contract.createToken(name, symbol);
      console.log("Transaction:", tx);
      
      const receipt = await tx.wait();
      console.log("Receipt:", receipt);
      
      // Event'i bul
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog.name === 'TokenCreated';
        } catch (e) {
          return false;
        }
      });
      
      if (!event) throw new Error("Token creation event not found");
      
      // Event'ten token adresini al
      const parsedEvent = contract.interface.parseLog(event);
      return parsedEvent.args[0]; // token address
    } catch (error) {
      console.error("Error creating token:", error);
      throw error;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "image") {
      setFormData({
        ...formData,
        image: e.target.files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };


  const uploadImage = async (image) => {
    const imageData = new FormData();
    imageData.append("files", image);

    const response = await fetch(
      "http://localhost:1337/api/upload",
      {
        method: "POST",
        body: imageData,
      }
    );

    const result = await response.json();
    return result[0].id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newTokenAddress = await createToken(formData.name, formData.ticker);
      if (newTokenAddress) {
        const imageId = await uploadImage(formData.image);
        const response = await fetch(
          "http://localhost:1337/api/memes",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: {
                name: formData.name,
                ticker: formData.ticker,
                desc: formData.description,
                address: newTokenAddress,
                telegram: formData.telegramLink,
                image: imageId,
              },
            }),
          }
        );
        const result = await response.json();
        
        // Modal'ı aç ve bilgileri göster
        setSuccessModal({
          isOpen: true,
          tokenAddress: newTokenAddress,
          transactionHash: result.data.attributes.hash,
          blockNumber: result.data.attributes.blockNumber,
        });

        // Form'u temizle
        setFormData({
          name: "",
          ticker: "",
          description: "",
          image: null,
          telegramLink: "",
          twitterLink: "",
          websiteLink: "",
          discordLink: "",
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800/50 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Create New Token</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-slate-200 mb-1.5"
              htmlFor="name"
            >
              Token Name
            </label>
            <input
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 
              rounded-lg shadow-sm text-slate-200 placeholder-slate-400
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
              transition duration-200"
              id="name"
              type="text"
              name="name"
              placeholder="Enter token name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-200 mb-1.5"
              htmlFor="ticker"
            >
              Token Ticker
            </label>
            <input
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 
              rounded-lg shadow-sm text-slate-200 placeholder-slate-400
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
              transition duration-200"
              id="ticker"
              type="text"
              name="ticker"
              placeholder="Enter token ticker (e.g. DOGE)"
              value={formData.ticker}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-200 mb-1.5"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 
              rounded-lg shadow-sm text-slate-200 placeholder-slate-400
              focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
              transition duration-200 min-h-[100px] resize-y"
              id="description"
              name="description"
              placeholder="Describe your token..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-200 mb-1.5"
              htmlFor="image"
            >
              Token Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-700 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-slate-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-slate-400">
                  <label
                    htmlFor="image"
                    className="relative cursor-pointer rounded-md font-medium text-blue-500 hover:text-blue-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-400">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Telegram Link
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.535.223l.19-2.712 4.94-4.465c.215-.19-.047-.297-.332-.107l-6.107 3.843-2.332-.725c-.663-.187-.663-.663.332-.975l9.063-3.49c.514-.174 1.108.164.98.435z"/>
                  </svg>
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 
                  rounded-lg shadow-sm text-slate-200 placeholder-slate-400
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                  transition duration-200"
                  type="text"
                  name="telegramLink"
                  placeholder="https://t.me/yourgroupname"
                  value={formData.telegramLink}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Twitter Link
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 
                  rounded-lg shadow-sm text-slate-200 placeholder-slate-400
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                  transition duration-200"
                  type="text"
                  name="twitterLink"
                  placeholder="https://twitter.com/username"
                  value={formData.twitterLink}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Website Link
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1 16.947V21h-2v-4.053c-3.94-.495-7-3.858-7-7.947h2c0 3.309 2.691 6 6 6s6-2.691 6-6h2c0 4.089-3.06 7.452-7 7.947z"/>
                  </svg>
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 
                  rounded-lg shadow-sm text-slate-200 placeholder-slate-400
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                  transition duration-200"
                  type="text"
                  name="websiteLink"
                  placeholder="https://yourwebsite.com"
                  value={formData.websiteLink}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5">
                Discord Link
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 
                  rounded-lg shadow-sm text-slate-200 placeholder-slate-400
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                  transition duration-200"
                  type="text"
                  name="discordLink"
                  placeholder="https://discord.gg/invite"
                  value={formData.discordLink}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 
            hover:from-blue-600 hover:to-blue-700 text-white font-medium
            transform transition-all duration-200 ease-in-out
            hover:scale-[1.02] active:scale-[0.98] 
            shadow-lg hover:shadow-xl
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={!isConnected}
          >
            {isConnected ? "Create Token" : "Connect Wallet to Create"}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {successModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Token Created Successfully! 🎉</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Token Address:</p>
                <p className="text-sm text-slate-200 break-all font-mono bg-slate-900 p-2 rounded">
                  {successModal.tokenAddress}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    const explorerBaseUrl = BLOCK_EXPLORERS[chainId] || "https://testnet.blockscout.com";
                    window.open(`${explorerBaseUrl}/token/${successModal.tokenAddress}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg 
                           transition duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on Explorer
                </button>

                <button
                  onClick={() => {
                    setSuccessModal({ ...successModal, isOpen: false });
                    window.open(
                      `/exchange/${successModal.tokenAddress}?newcreated=true`, 
                      '_blank', 
                      'noopener,noreferrer'
                    );
                  }}
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg 
                           transition duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Token Details
                </button>
              </div>

              <button
                onClick={() => setSuccessModal({ ...successModal, isOpen: false })}
                className="w-full px-4 py-2 mt-4 text-slate-300 hover:text-white 
                         border border-slate-600 hover:border-slate-500 rounded-lg 
                         transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Create;
