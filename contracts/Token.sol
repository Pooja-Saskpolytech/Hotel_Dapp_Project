//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";


contract BookingToken is ERC20 {
    address public owner;

    

    modifier onlyOwner() {
        require(msg.sender == owner, "owner restricted funtionality");
        _;
    }

    constructor(address _owner) payable ERC20("BlockChain Project", "HotelDapp") {
        owner = _owner;
    }

    

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }

    
}