import Token from "../components/Token";
import { useEffect, useState } from "react";
import React from "react";
import { formatDistance } from "date-fns";

const Home = () => {
  const [search, setSearch] = useState("");
  const [tokens, setTokens] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "http://localhost:1337/api/memes?populate=*"
      );
      const result = await response.json();
      const data = result.data.map((item) => {
        const defaultLogoUrl =
          "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg?1696528776";
        const imageUrl = item.attributes.image?.data?.attributes?.url
          ? item.attributes.image.data.attributes.url
          : defaultLogoUrl;
        return {
          address: item.attributes.address,
          logoUrl: imageUrl,
          name: item.attributes.name,
          ticker: item.attributes.ticker,
          description: item.attributes.desc || "No description available",
        };
      });
      setTokens(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearch = () => {
    setTokens((prevTokens) =>
      prevTokens.filter(
        (token) =>
          token.address?.toLowerCase().includes(search.toLowerCase()) ||
          token.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [search]);

  return (
    <div className="page-layout">
      <div className="relative w-full max-w-2xl mx-auto mt-5 mb-4">
        <div className="relative">
          <input
            className="w-full px-4 py-3 pl-12 text-sm text-gray-200 
                     bg-slate-800/90 border border-slate-700 
                     rounded-xl transition-all duration-300
                     placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent
                     hover:border-blue-500"
            type="text"
            placeholder="Search by token name or address (e.g. 0x1234...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg 
              className="w-5 h-5 text-gray-400"
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        {search && (
          <div className="absolute right-3 top-3">
            <button
              onClick={() => setSearch('')}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatsCard 
          title="Total Tokens" 
          value={tokens.length} 
          icon="🏦"
        />
        <StatsCard 
          title="Total Volume" 
          value="1.2M USDT" 
          icon="📊"
        />
        <StatsCard 
          title="Active Traders" 
          value="2.5K" 
          icon="👥"
        />
      </div>

      {tokens[0] && (
        <div className="bg-slate-800/90 rounded-xl p-6 mb-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">Featured Token</h2>
          <div className="flex items-start space-x-4">
            <img 
              src={tokens[0].logoUrl} 
              alt={tokens[0].name}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold">{tokens[0].name}</h3>
              <p className="text-gray-400 text-sm mb-2">{tokens[0].description}</p>
              <div className="flex items-center space-x-2 text-sm">
                <span className="px-2 py-1 bg-cyan-900/30 rounded-lg">
                  {tokens[0].ticker}
                </span>
                <span className="text-gray-400">
                  Listed {formatDistance(new Date(), new Date('2024-01-01'))} ago
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {tokens.map((token) => (
          <Token
            key={token.address || token.name}
            logoUrl={token.logoUrl}
            name={token.name}
            ticker={token.ticker}
            description={token.description}
            address={token.address}
          />
        ))}
      </div>

      {tokens.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400 text-lg">No tokens found matching your search.</p>
        </div>
      )}
    </div>
  );
};

const StatsCard = ({ title, value, icon }) => (
  <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700">
    <div className="flex items-center justify-between mb-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs text-gray-400">Last 24h</span>
    </div>
    <p className="text-sm text-gray-400">{title}</p>
    <p className="text-xl font-bold text-cyan-400">{value}</p>
  </div>
);

export default Home;
