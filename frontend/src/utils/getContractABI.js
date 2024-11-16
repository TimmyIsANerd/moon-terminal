import TokenLaunchpadAbi from '../abis/TokenLaunchpad.json';
import IERC20ForSplFactoryAbi from '../abis/IERC20ForSplFactory.json';

/**
 * Returns contract ABI and factory address based on chain ID
 * @param {number} chainId - The blockchain network ID
 * @returns {{abi: any, factoryAddress: string | null}}
 */
export function getContractABI(chainId) {
  // Neon networks
  if (chainId === 245022926 || chainId === 245022934) {
    return {
      abi: [
        "function createToken(string memory name, string memory symbol) external returns (address)",
        "event TokenCreated(address indexed tokenAddress, string name, string symbol)"
      ],
      factoryAddress: "0xF4804d1e6D2504ce37046E971dfFC7F783Fa3070"
    };
  }
  
  // Default for other networks
  return {
    abi: [
      "function createToken(string memory name, string memory symbol) external returns (address)",
      "event TokenCreated(address indexed tokenAddress, string name, string symbol)"
    ],
    factoryAddress: null
  };
} 