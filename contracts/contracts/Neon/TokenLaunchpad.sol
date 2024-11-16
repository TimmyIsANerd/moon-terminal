// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20ForSplFactory {
    function createErc20ForSplMintable(
        string memory name,
        string memory symbol,
        uint8 decimals,
        address mintAuthority
    ) external returns (address);
}

interface IERC20ForSpl {
    function mint(address to, uint256 amount) external;
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TokenLaunchpadNeon {
    IERC20ForSplFactory public erc20ForSplFactory;
    address public factoryAddress;

    mapping(address => uint256) public tokenPrices;
    mapping(address => address) public tokens;

    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol
    );

    constructor(address _factoryAddress) {
        factoryAddress = _factoryAddress;
        erc20ForSplFactory = IERC20ForSplFactory(_factoryAddress);
    }

    function createToken(
        string memory name,
        string memory symbol
    ) public returns (address) {
        uint8 decimals = 18;
        address mintAuthority = address(this);

        address newTokenAddress = erc20ForSplFactory.createErc20ForSplMintable(
            name,
            symbol,
            decimals,
            mintAuthority
        );

        IERC20ForSpl newToken = IERC20ForSpl(newTokenAddress);

        uint256 amount = 1_000_000_000 * (10 ** uint256(decimals - 10));

        newToken.mint(address(this), amount);

        tokens[newTokenAddress] = newTokenAddress;
        tokenPrices[newTokenAddress] = 100 wei;

        emit TokenCreated(newTokenAddress, name, symbol);
        return newTokenAddress;
    }

    function buyToken(address tokenAddress, uint256 amount) public payable {
        uint256 totalPrice = (tokenPrices[tokenAddress] * amount) / (10 ** 18);
        require(msg.value >= totalPrice, "Insufficient Ether sent");

        IERC20ForSpl token = IERC20ForSpl(tokenAddress);
        require(
            token.balanceOf(address(this)) >= amount,
            "Not enough tokens available"
        );

        token.transfer(msg.sender, amount);

        // Increase the price by 1% after a buy transaction
        tokenPrices[tokenAddress] =
            tokenPrices[tokenAddress] +
            (tokenPrices[tokenAddress] / 100);
    }

    function sellToken(address tokenAddress, uint256 amount) public {
        IERC20ForSpl token = IERC20ForSpl(tokenAddress);
        require(
            token.balanceOf(msg.sender) >= amount,
            "Insufficient token balance"
        );

        uint256 totalPrice = (tokenPrices[tokenAddress] * amount) / (10 ** 18);

        token.transfer(address(this), amount);
        payable(msg.sender).transfer(totalPrice);

        // Decrease the price by 1% after a sell transaction
        tokenPrices[tokenAddress] =
            tokenPrices[tokenAddress] -
            (tokenPrices[tokenAddress] / 100);
    }

    function getTokenPrice(address tokenAddress) public view returns (uint256) {
        return tokenPrices[tokenAddress];
    }
}
