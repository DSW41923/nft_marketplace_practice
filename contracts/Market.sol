// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;
  Counters.Counter private _transactionIds;

  address payable owner;
  uint256 listingPrice = 0.025 ether;

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;

  event MarketItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
  );

  struct MarketTransaction {
    uint transactionId;
    uint256 tokenId;
    address payable seller;
    address payable buyer;
    uint256 price;
  }

  mapping(uint256 => MarketTransaction) private idToMarketTransaction;

  event MarketTransactionCreated (
    uint indexed transactionId,
    uint256 tokenId,
    address seller,
    address buyer,
    uint256 price
  );

  /* Returns the listing price of the contract */
  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }

  /* Places an item for sale on the marketplace */
  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {
    require(price > 0, "Price must be positive");

    uint256 itemId = _itemIds.current();
    _itemIds.increment();

    idToMarketItem[itemId] =  MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false
    );

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit MarketItemCreated(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      false
    );
  }

  /* Creates the sale of a marketplace item */
  /* Transfers ownership of the item, as well as funds between parties */
  function createMarketSale(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;
    require(msg.value == price, "Please submit the asking price in order to complete the purchase");

    idToMarketItem[itemId].seller.transfer(msg.value);
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    _itemsSold.increment();
    payable(owner).transfer(listingPrice);

    uint256 transactionId = _transactionIds.current();
    _transactionIds.increment();

    idToMarketTransaction[transactionId] =  MarketTransaction(
      transactionId,
      tokenId,
      payable(idToMarketItem[itemId].seller),
      payable(msg.sender),
      price
    );

    emit MarketTransactionCreated(
      transactionId,
      tokenId,
      idToMarketItem[itemId].seller,
      msg.sender,
      price
    );

  }

  function deleteMarketSale(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint tokenId = idToMarketItem[itemId].tokenId;
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketItem[itemId].seller = payable(address(0));
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    _itemsSold.increment();
  }

  function resellMarketItem(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint tokenId = idToMarketItem[itemId].tokenId;
    console.log(IERC721(nftContract).ownerOf(tokenId));
    console.log(msg.sender);
    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    idToMarketItem[itemId].price = msg.value;
    idToMarketItem[itemId].seller = payable(msg.sender);
    idToMarketItem[itemId].owner = payable(address(this));
    idToMarketItem[itemId].sold = false;
    _itemsSold.decrement();
  }

  /* Returns all unsold market items */
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i].sold == false) {
        MarketItem storage currentItem = idToMarketItem[i];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns all market transactions */
  function fetchMarketTransactions() public view returns (MarketTransaction[] memory) {
    uint256 transactionCount = _transactionIds.current();

    MarketTransaction[] memory transactions = new MarketTransaction[](transactionCount);
    for (uint i = 0; i < transactionCount; i++) {
      MarketTransaction storage currentTransaction = idToMarketTransaction[i];
      transactions[i] = currentTransaction;
    }
    return transactions;
  }

  /* Returns only items that a user has purchased */
  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i].owner == msg.sender || (idToMarketItem[i].seller == msg.sender) && !idToMarketItem[i].sold) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i].owner == msg.sender || (idToMarketItem[i].seller == msg.sender) && !idToMarketItem[i].sold) {
        uint currentId = i;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
}
