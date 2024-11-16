import { useState } from "react";
import React from "react";
import TokenLaunchpadAbi from "../abis/TokenLaunchpad.json";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import { BrowserProvider, Contract, Interface } from "ethers";

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

  const { address, chainId, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

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
      "/api/upload",
      {
        method: "POST",
        body: imageData,
      }
    );

    const result = await response.json();
    return result[0].id;
  };

  const createToken = async (name, symbol) => {
    try {
      const provider = new BrowserProvider(walletProvider);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const tokenLaunchpadAddress =
        "0x039DDcb7776be78A006F30e79949da53F8691538";
      const TokenLaunchpad = new Contract(
        tokenLaunchpadAddress,
        TokenLaunchpadAbi.abi,
        signer
      );

      const tx = await TokenLaunchpad.createToken(name, symbol);
      const receipt = await tx.wait();

      const eventAbi = [
        "event TokenCreated(address indexed tokenAddress, string name, string symbol)",
      ];
      const iface = new Interface(eventAbi);

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
      return newTokenAddress;
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
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
        console.log("Content created:", result);
      } else {
        console.error("Token creation failed, no address returned.");
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
    </div>
  );
};

export default Create;
