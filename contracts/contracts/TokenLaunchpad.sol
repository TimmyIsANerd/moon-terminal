// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CustomERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) {
        _mint(owner, initialSupply); // Mint the initial supply to the contract owner
    }
}

contract TokenLaunchpad {
    address public owner;
    mapping(address => uint256) public tokenPrices;
    mapping(address => address) public tokens;

    event TokenCreated(
        address indexed tokenAddress,
        string name,
        string symbol
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createToken(
        string memory name,
        string memory symbol
    ) public onlyOwner returns (address) {
        uint256 initialSupply = 1_000_000_000 * 10 ** 18; // 1 billion tokens with 18 decimals

        // Deploy new CustomERC20 token
        CustomERC20 newToken = new CustomERC20(name, symbol, initialSupply, address(this));

        tokens[address(newToken)] = address(newToken);
        tokenPrices[address(newToken)] = 100 wei;

        emit TokenCreated(address(newToken), name, symbol);
        return address(newToken);
    }

    function buyToken(address tokenAddress, uint256 amount) public payable {
        uint256 totalPrice = (tokenPrices[tokenAddress] * amount) / (10 ** 18);
        require(msg.value >= totalPrice, "Insufficient Ether sent");

        ERC20 token = ERC20(tokenAddress);
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
        ERC20 token = ERC20(tokenAddress);
        require(
            token.balanceOf(msg.sender) >= amount,
            "Insufficient token balance"
        );

        uint256 totalPrice = (tokenPrices[tokenAddress] * amount) / (10 ** 18);

        token.transferFrom(msg.sender, address(this), amount);
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
