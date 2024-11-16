import { Outlet, Link, useLocation } from "react-router-dom";
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react';
import React, { useState, useEffect } from "react";
import { getChainIcon } from "../utils/chainUtils";


const Layout = () => {
    const { open } = useWeb3Modal();
    const { address, isConnected, chainId } = useWeb3ModalAccount();
    const location = useLocation();
    const [networkInfo, setNetworkInfo] = useState({ name: "Not Connected", chainId: null });

    useEffect(() => {
        const updateNetworkInfo = async () => {
            try {
                if (!isConnected) { 
                    setNetworkInfo({ name: "Not Connected", chainId: null });
                    return;
                }
    
                let networkData;
                switch (chainId) {
                    case 11155111:
                        networkData = { name: "Sepolia", chainId };
                        break;
                    case 545:
                        networkData = { name: "Flow", chainId };
                        break;
                    case 245022926:
                        networkData = { name: "Neon", chainId };
                        break;
                    default:
                        networkData = { 
                            name: "Unknown Network", 
                            chainId 
                        };
                }
                setNetworkInfo(networkData);
            } catch (error) {
                console.error("Network info error:", error);
                setNetworkInfo({ name: "Error", chainId: null });
            }
        };
    
        updateNetworkInfo();
    }, [isConnected, chainId]);
    
    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    const NetworkDisplay = () => {
        if (!isConnected) {
            return (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm font-medium text-slate-200">
                        Not Connected
                    </span>
                </div>
            );
        } 
    
        return (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-slate-600">
                <div className="flex items-center gap-2">
                    <img 
                        src={getChainIcon(networkInfo.chainId || 0)} 
                        alt={networkInfo.name}
                        className="w-5 h-5 rounded-full object-contain"
                    />
                    <div className={`w-2 h-2 rounded-full ${networkInfo.chainId ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium text-slate-200">
                        {networkInfo.name}
                        {networkInfo.name === "Unknown Network" && networkInfo.chainId && (
                            <span className="ml-1 text-slate-400">
                                (Chain ID: {networkInfo.chainId})
                            </span>
                        )}
                    </span>
                </div>
            </div>
        );
    };
    

    return (
    <div className="min-h-screen bg-slate-900">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Navigation */}
                    <nav className="flex items-center gap-8">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            EVMeme
                        </h1>
                        <div className="hidden md:flex items-center gap-6">
                            <Link 
                                to="/"
                                className={`nav-link ${isActiveRoute('/') ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}`}
                            >
                                Home
                            </Link>
                            <Link 
                                to="/create"
                                className={`nav-link ${isActiveRoute('/create') ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}`}
                            >
                                Launch
                            </Link>
                        </div>
                    </nav>

                    {/* Network & Wallet Section */}
                    <div className="flex items-center gap-4">
                        <NetworkDisplay />

                        {/* Network Selector Button */}
                        {address && (
                            <button 
                                onClick={() => open({ view: 'Networks' })}
                                className="hidden sm:flex items-center px-3 py-1.5 rounded-lg 
                                         bg-slate-700/50 hover:bg-slate-700 border border-slate-600 
                                         text-sm font-medium text-slate-200 transition-colors"
                            >
                                Switch Network
                            </button>
                        )}

                        {/* Wallet Button */}
                        <button 
                            onClick={() => open()}
                            className="flex items-center px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                        >
                            {address ? (
                                <span className="font-medium">
                                    {address.substring(0,6)}...{address.substring(address.length - 4)}
                                </span>
                            ) : (
                                <span className="font-medium">Connect Wallet</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-slate-700">
                <div className="flex justify-center gap-4 py-3">
                    <Link 
                        to="/"
                        className={`nav-link ${isActiveRoute('/') ? 'text-blue-500' : 'text-slate-300'}`}
                    >
                        Home
                    </Link>
                    <Link 
                        to="/create"
                        className={`nav-link ${isActiveRoute('/create') ? 'text-blue-500' : 'text-slate-300'}`}
                    >
                        Create
                    </Link>
                </div>
            </div>
        </header>

        {/* Main Content */}
        <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
            <Outlet />
        </main>

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700">
            <div className="max-w-7xl mx-auto px-4 py-4 text-center text-slate-400 text-sm">
                EVMeme © {new Date().getFullYear()} All rights reserved.
            </div>
        </footer>
    </div>

    );
};

export default Layout;

