// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("Demo Non-fungible  Tokens", "DNFT") {
        contractAddress = marketplaceAddress;
    }

    function createToken() public returns (uint) {
        uint256 newItemId = _tokenIds.current();
        _tokenIds.increment();

        _mint(msg.sender, newItemId);
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }
}
