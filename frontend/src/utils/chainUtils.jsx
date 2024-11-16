export function getChainIcon(chainId) {
  console.log("chainId",chainId);
  switch (chainId) {
    case 1:
      return 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628'
    case 245022926:
      return 'https://assets.coingecko.com/coins/images/28331/standard/neon_%281%29.png?1696527338'
    case 11155111:
      return 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628'
    case 545:
      return 'https://assets.coingecko.com/coins/images/13446/standard/5f6294c0c7a8cda55cb1c936_Flow_Wordmark.png?1696513210'
    case 2810:
      return 'https://icons.llamao.fi/icons/chains/rsz_morph.jpg'
    case 21097:
      return 'https://ethglobal.b-cdn.net/organizations/eu794/square-logo/default.png'
    case 31:
      return 'https://ethglobal.b-cdn.net/organizations/ggpyp/square-logo/default.png'
    default:
      return 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628'
  }
} 