import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import TokenLaunchpadAbi from "../abis/TokenLaunchpad.json";
import { createChart, ColorType } from 'lightweight-charts';
import LoadingBar from 'react-top-loading-bar';

import {
  Contract,
  formatEther,
  parseEther,
  BrowserProvider,
  parseUnits,
  toBigInt,
} from "ethers";
import {
  useWeb3ModalProvider,
  useWeb3ModalAccount,
} from "@web3modal/ethers/react";
import tradesData from '../data/trades.json';
import commentsData from '../data/comments.json';
import holdersData from '../data/holders.json';
import projectData from '../data/project.json';
import tradeData from '../data/tradedata.json';

const tokenPair = [
  {
    ticker: "$PP",
    logoUrl:
      "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg?1696528776",
  },
  {
    ticker: "$ETH",
    logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  },
];

export const ChartComponent = props => {
  const {
      data,
      colors: {
          backgroundColor = '#2D2C3D', // Dracula background
          upColor = '#50fa7b', // Dracula green for up bars
          downColor = '#ff5555', // Dracula red for down bars
          textColor = '#f8f8f2', // Dracula text color
      } = {},
  } = props;

  const chartContainerRef = useRef();

  useEffect(() => {
      const handleResize = () => {
          chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      };

      const chart = createChart(chartContainerRef.current, {
          layout: {
              background: { type: ColorType.Solid, color: backgroundColor },
              textColor,
          },
          width: chartContainerRef.current.clientWidth,
          height: 360,
      });
      chart.timeScale().fitContent();

      const barSeries = chart.addCandlestickSeries({
          upColor,
          downColor,
          borderUpColor: upColor,
          borderDownColor: downColor,
          wickUpColor: upColor,
          wickDownColor: downColor,
      });
      barSeries.setData(data);

      window.addEventListener('resize', handleResize);

      return () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
      };
  }, [data, backgroundColor, upColor, downColor, textColor]);

  return (
      <div
          ref={chartContainerRef}
          style={{ width: '100%', height: '300px' }}
      />
  );
};

const ProjectInfo = () => {
  return (
    <div className="bg-cyan-900/[.09] rounded-xl p-5 border border-[#2dd4bf32]">
      <h2 className="text-2xl font-bold mb-4">PepeCoin</h2>
      <p className="text-gray-300 mb-6">
        A community-driven meme token powered by the Ethereum blockchain, featuring our beloved Pepe character.
      </p>
      
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold mb-2">Links</h3>
        <div className="grid grid-cols-2 gap-2">
          <a href="#" className="bg-cyan-900/[.09] px-4 py-2 rounded-lg border border-[#2dd4bf32] text-center hover:bg-cyan-800/20 transition-colors">
            Website
          </a>
          <a href="#" className="bg-cyan-900/[.09] px-4 py-2 rounded-lg border border-[#2dd4bf32] text-center hover:bg-cyan-800/20 transition-colors">
            Twitter
          </a>
          <a href="#" className="bg-cyan-900/[.09] px-4 py-2 rounded-lg border border-[#2dd4bf32] text-center hover:bg-cyan-800/20 transition-colors">
            Telegram
          </a>
          <a href="#" className="bg-cyan-900/[.09] px-4 py-2 rounded-lg border border-[#2dd4bf32] text-center hover:bg-cyan-800/20 transition-colors">
            Discord
          </a>
        </div>
      </div>
    </div>
  );
};

const PageHeader = () => {
  return (
    <div className="w-4/5 m-auto mt-8 mb-6">
      <div className="flex items-center gap-4 mb-2">
        <img 
          src={tokenPair[0].logoUrl} 
          alt="Token Logo" 
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h1 className="text-3xl font-bold text-white">
            {projectData.name}
          </h1>
          <p className="text-cyan-400">
            The Most Popular Meme Coin on Ethereum
          </p>
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="bg-cyan-900/[.09] px-4 py-2 rounded-lg border border-[#2dd4bf32]">
          <p className="text-sm text-gray-400">Market Cap</p>
          <p className="text-xl font-semibold">{projectData.tokenomics.marketCap}</p>
        </div>
        <div className="bg-cyan-900/[.09] px-4 py-2 rounded-lg border border-[#2dd4bf32]">
          <p className="text-sm text-gray-400">Total Supply</p>
          <p className="text-xl font-semibold">{projectData.tokenomics.totalSupply}</p>
        </div>
        <div className="bg-cyan-900/[.09] px-4 py-2 rounded-lg border border-[#2dd4bf32]">
          <p className="text-sm text-gray-400">Initial Price</p>
          <p className="text-xl font-semibold">{projectData.tokenomics.initialPrice}</p>
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ totalRaised, targetAmount }) => {
  return (
    <div className="col-span-1 bg-cyan-900/[.09] rounded-xl p-5 row-span-1 border border-[#2dd4bf32]">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-300">Progress (24%)</span>
        <span className="text-sm text-gray-300">{totalRaised} / {targetAmount} ETH 🏁</span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-4">
        <div 
          className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: '24%' }}
        />
      </div>
    </div>
  );
};

const Exchange = () => {
  const { address } = useParams();
  const [token1Amount, setToken1Amount] = useState(0);
  const [token2Amount, setToken2Amount] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [account, setAccount] = useState("");
  const [comOrTrade, setComOrTrade] = useState("comment");
  const [swapToggle, setSwapToggle] = useState(true);
  const { walletProvider } = useWeb3ModalProvider();
  const { useraddress, chainId, isConnected } = useWeb3ModalAccount();
  const [comments, setComments] = useState([]);
  const [trades, setTrades] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [commentsError, setCommentsError] = useState(null);
  const [tradesError, setTradesError] = useState(null);
  const [holders, setHolders] = useState([]);
  const [totalRaised, setTotalRaised] = useState(0);
  const TARGET_AMOUNT = 5000; // hedef miktar
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setHolders(holdersData.holders);
  }, []);

  const customData = tradeData.customData;

  const handleToken1Change = (e) => {
    const amount = e.target.value;
    setToken1Amount(amount);
    const token2Amount = swapToggle ? amount * tokenPrice : amount / tokenPrice;
    setToken2Amount(token2Amount);
  };

  useEffect(() => {
    async function connectToProvider() {
      try {
        // Connect to Ethereum provider
        const provider = new BrowserProvider(walletProvider);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        setAccount(signer);
        const tokenLaunchpadAddress =
          "0x9c670237cfdE371eb6b2C250637d0a13A8b7a281";
        const tokenAddress = address;

        console.log("tokenAddress", tokenAddress);

        const TokenLaunchpad = new Contract(
          tokenLaunchpadAddress,
          TokenLaunchpadAbi.abi,
          signer
        );

        // Show token price
        let price = await TokenLaunchpad.getTokenPrice(tokenAddress);

        setTokenPrice(price.toString());

        // Toplam toplanan miktarı al
        let raised = await TokenLaunchpad.getTotalRaised(tokenAddress);
        setTotalRaised(parseFloat(formatEther(raised)));
      } catch (error) {
        console.error("Error connecting to provider:", error);
      }
    }

    connectToProvider();
  }, [address, walletProvider]);

  const swap = async () => {
    if (swapToggle) {
      await sellToken();
    } else {
      await buyToken();
    }
  };

  const buyToken = async () => {
    try {
      const provider = new BrowserProvider(walletProvider);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const tokenLaunchpadAddress =
        "0x9c670237cfdE371eb6b2C250637d0a13A8b7a281";
      const tokenAddress = address;

      const TokenLaunchpad = new Contract(
        tokenLaunchpadAddress,
        TokenLaunchpadAbi.abi,
        signer
      );

      // Buy tokens

      let buyprice = await TokenLaunchpad.getTokenPrice(tokenAddress);

      const buyValue = buyprice * toBigInt(token1Amount);
      console.log("Buy click");
      console.log("buyValue", buyValue);
      console.log("token1Amount", token1Amount);

      const buyTx = await TokenLaunchpad.buyToken(
        tokenAddress,
        token1Amount.toString(),
        {
          value: buyValue,
        }
      );
      await buyTx.wait();

      // Show token price after buying
      let priceAfterBuying = await TokenLaunchpad.getTokenPrice(tokenAddress);
      setTokenPrice(parseFloat(formatEther(priceAfterBuying)));
    } catch (error) {
      console.error("Error buying tokens:", error);
    }
  };

  const sellToken = async () => {
    try {
      const provider = new BrowserProvider(walletProvider);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const tokenLaunchpadAddress =
        "0x9c670237cfdE371eb6b2C250637d0a13A8b7a281";
      const tokenAddress = address;

      const TokenLaunchpad = new Contract(
        tokenLaunchpadAddress,
        TokenLaunchpadAbi.abi,
        signer
      );

      // Sell tokens
      const sellTx = await TokenLaunchpad.sellToken(
        tokenAddress,
        toBigInt(token1Amount)
      );
      await sellTx.wait();

      // Show token price after selling
      let priceAfterSelling = await TokenLaunchpad.getTokenPrice(tokenAddress);
      setTokenPrice(parseFloat(formatEther(priceAfterSelling)));
    } catch (error) {
      console.error("Error selling tokens:", error);
    }
  };

  // Comments verilerini yükle
  useEffect(() => {
    try {
      setCommentsLoading(true);
      setComments(commentsData.comments);
      setCommentsError(null);
    } catch (error) {
      console.error('Error loading comments:', error);
      setCommentsError('Comments could not be loaded');
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  // Trades verilerini yükle
  useEffect(() => {
    try {
      setTradesLoading(true);
      setTrades(tradesData.trades);
      setTradesError(null);
    } catch (error) {
      console.error('Error loading trades:', error);
      setTradesError('Trades could not be loaded');
    } finally {
      setTradesLoading(false);
    }
  }, []);

  // Comments render fonksiyonu
  const renderComments = () => {
    if (commentsLoading) return <p className="text-center mt-4">Loading comments...</p>;
    if (commentsError) return <p className="text-center mt-4 text-red-500">{commentsError}</p>;
    if (!comments || comments.length === 0) return <p className="text-center mt-4">No comments found</p>;

    return comments.map((comment) => (
      <div key={comment.id} className="mt-2">
        <hr className="border-cyan-700/30" />
        <p className="font-bold text-sm mt-1 text-cyan-100">
          {comment.address}
        </p>
        <p className="mt-1">{comment.message}</p>
      </div>
    ));
  };

  // Trades render fonksiyonu
  const renderTrades = () => {
    if (tradesLoading) return <p className="text-center mt-4">Loading trades...</p>;
    if (tradesError) return <p className="text-center mt-4 text-red-500">{tradesError}</p>;
    if (!trades || trades.length === 0) return <p className="text-center mt-4">No trades found</p>;

    return (
      <div className="space-y-2">
        {trades.map((trade) => {
          const isBuy = trade.fromToken === "ETH"; // ETH ile alım yapılıyorsa buy işlemi
          
          return (
            <div key={trade.id} className="py-2">
              <p className={`font-medium ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                {trade.address.slice(0, 6)}...{trade.address.slice(-4)} 
                {' '}swapped{' '}
                <span className="font-bold">
                  {trade.fromAmount} ${trade.fromToken}
                </span>
                {' '}for{' '}
                <span className="font-bold">
                  {Number(trade.toAmount).toLocaleString()} ${trade.toToken}
                </span>
                {' '}
                {isBuy ? '🟢' : '🔴'}
              </p>
              <hr className="border-cyan-800/50 mt-2" />
            </div>
          );
        })}
      </div>
    );
  };

  const renderHolders = () => {
    return (
      <div className="col-span-1 bg-cyan-900/[.09] rounded-xl p-5 row-span-1 border border-[#2dd4bf32] h-min">
        <p className="font-bold text-xl">holders distribution</p>
        <hr className="border-cyan-800/50" />
        <ol className="list-decimal list-inside">
          {holders.map((holder, index) => (
            <li key={index}>
              <span role="img" aria-label="holder type">{holder.emoji}</span>
              {' '}{holder.address}
              {holder.type === 'bonding_curve' ? ' (bonding curve)' : ''}
              {holder.type === 'dev' ? ' (dev)' : ''} 
              ({holder.percentage}%)
            </li>
          ))}
        </ol>
      </div>
    );
  };

  return (
    <>
      <LoadingBar
        color="#00bcd4"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <PageHeader />
      <div className="grid grid-cols-4 w-4/5 m-auto mt-10 gap-4">
        <div className="col-span-3 flex flex-col gap-16">
          <div className="bg-[#1e293b] rounded-xl pt-4 pb-8 px-4 border border-[#2dd4bf32] overflow-hidden">
            <div className="w-full h-[350px]">
              <ChartComponent 
                data={customData} 
                options={{
                  layout: {
                    padding: {
                      left: 10,
                      right: 10,
                      top: 10,
                      bottom: 2
                    }
                  },
                  maintainAspectRatio: false,
                  responsive: true
                }}
                height={350}
              />
            </div>
          </div>
          <div className="bg-cyan-900/[.09] rounded-xl p-5 border border-[#2dd4bf32]">
            <div className="flex flex-row gap-2 mb-4">
              <button 
                className={`font-bold text-l cursor-pointer p-1 px-2 rounded-lg ${
                  comOrTrade === 'comment' 
                    ? "bg-cyan-600 text-white" 
                    : "bg-cyan-800/40 text-white"
                }`}
                onClick={() => setComOrTrade("comment")}
              >
                comments
              </button>
              <button 
                className={`font-bold text-l cursor-pointer p-1 px-2 rounded-lg ${
                  comOrTrade === 'trade' 
                    ? "bg-cyan-600 text-white" 
                    : "bg-cyan-800/40 text-white"
                }`}
                onClick={() => setComOrTrade("trade")}
              >
                trades
              </button>
            </div>
            <hr className="border-cyan-800/50" />
            <div className="mt-4">
              {comOrTrade === "comment" ? (
                <>
                  <div className="grid grid-cols-10 gap-2 mb-4">
                    <input 
                      className="rounded focus:outline-none text-foreground w-full col-span-9"
                      placeholder="Enter your comment..."
                    />
                    <button className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded hover:from-cyan-600 hover:to-teal-600 font-bold py-1 px-1 w-full col-span-1 transition duration-200">
                      submit
                    </button>
                  </div>
                  {renderComments()}
                </>
              ) : (
                renderTrades()
              )}
            </div>
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <ProgressBar totalRaised={totalRaised} targetAmount={TARGET_AMOUNT} />
          <ProjectInfo />
          <div className="max-w-md mx-auto p-5 rounded-xl row-span-1 bg-cyan-900/[.09] flex flex-col justify-center border border-[#2dd4bf32]">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img
                  src={swapToggle ? tokenPair[0].logoUrl : tokenPair[1].logoUrl}
                  alt="Token 1"
                  className="h-6 w-6 mr-2"
                />
                <label
                  htmlFor="token1"
                  className="text-sm font-semibold text-foreground"
                >
                  {swapToggle ? tokenPair[0].ticker : tokenPair[1].ticker}
                </label>
              </div>
              <input
                id="token1"
                type="number"
                value={token1Amount}
                onChange={handleToken1Change}
                className="w-4/6 py-1 px-2 border rounded focus:outline-none text-foreground"
              />
            </div>
            <div className="flex justify-center items-center my-4">
              <button
                onClick={() => {
                  setSwapToggle(!swapToggle);
                  setToken1Amount(0);
                  setToken2Amount(0);
                }}
                className="text-pink focus:outline-none"
              >
                <svg
                  width="800px"
                  height="800px"
                  className="h-6 w-6"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16 3.93a.75.75 0 0 1 1.177-.617l4.432 3.069a.75.75 0 0 1 0 1.233l-4.432 3.069A.75.75 0 0 1 16 10.067V8H4a1 1 0 0 1 0-2h12V3.93zm-9.177 9.383A.75.75 0 0 1 8 13.93V16h12a1 1 0 1 1 0 2H8v2.067a.75.75 0 0 1-1.177.617l-4.432-3.069a.75.75 0 0 1 0-1.233l4.432-3.069z"
                    fill="#000000"
                  />
                </svg>
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img
                  src={swapToggle ? tokenPair[1].logoUrl : tokenPair[0].logoUrl}
                  alt="Token 2"
                  className="h-6 w-6 mr-2"
                />
                <label
                  htmlFor="token2"
                  className="text-sm font-semibold text-foreground"
                >
                  {swapToggle ? tokenPair[1].ticker : tokenPair[0].ticker}
                </label>
              </div>
              <input
                id="token2"
                type="number"
                value={token2Amount}
                className="w-4/6 py-1 px-2 border rounded focus:outline-none text-foreground"
                disabled
              />
            </div>
            <div className="flex justify-center mt-4">
              <button
                className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded 
                hover:from-cyan-600 hover:to-teal-600 mt-2 font-bold py-2 px-4 w-full
                transition duration-200"
                onClick={() => swap()}
              >
                Swap
              </button>
            </div>
          </div>
        
          {renderHolders()}
        </div>
      </div>
    </>
  );
};

export default Exchange;
