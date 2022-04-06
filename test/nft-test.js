const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNftMarket", function () {});

describe("MyNFT", function () {
  this.timeout(50000);

  let myNFT;
  let owner;
  let acc1;
  let acc2;
  let market;

  it("Should create and execute market sales", async function () {
    const MyNFT = await ethers.getContractFactory("MyNFT");
    [owner, acc1, acc2] = await ethers.getSigners();

    const MyNftMarket = await ethers.getContractFactory("MyNftMarket");
    market = await MyNftMarket.deploy();
    await market.deployed();

    myNFT = await MyNFT.deploy();
    await myNFT.deployed();

    const auctionPrice = ethers.utils.parseUnits("10", "ether");

    const nftContractAddress = myNFT.address;
    const transaction = await myNFT.mint("https://example.com/1");
    await myNFT.approve(market.address, 1);
    await market.listToken(nftContractAddress, 1, auctionPrice);
    const tx = await transaction.wait();
    console.log(tx.events[0].args[2]);

    await market.buyToken(0, { value: auctionPrice });

    const listingLength = await market.getListingLength();

    for (let index = 0; index < listingLength; index++) {
      const listing = await market.getListing(index);
      const [seller, owner, token, tokenId, price, sold] = listing;
      // console.log(seller, owner, token, tokenId);
      const tokenUri = await myNFT.tokenURI(tokenId);
      console.log(tokenUri);
    }
  });
});
