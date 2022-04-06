import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import MyNFTMarketContractAddress from "../contracts/MyNFTMarket-address.json";
import MyNFTContractAddress from "../contracts/MyNFT-address.json";
import { BigNumber, ethers } from "ethers";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

export const createNft = async (
  minterContract,
  marketContract,
  performActions,
  { name, price, description, ipfsImage, ownerAddress, attributes }
) => {
  await performActions(async (kit) => {
    if (!name || !description || !ipfsImage) return;
    const { defaultAccount } = kit;

    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      name,
      description,
      image: ipfsImage,
      owner: defaultAccount,
      attributes,
    });

    try {
      // save NFT metadata to IPFS
      const added = await client.add(data);

      // IPFS url for uploaded metadata
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;

      // mint the NFT and save the IPFS url to the blockchain
      let tx = await minterContract.methods
        .mint(url)
        .send({ from: defaultAccount });
      let tokenId = BigNumber.from(tx.events.Transfer.returnValues.tokenId);

      await minterContract.methods
        .approve(MyNFTMarketContractAddress.MyNFTMarket, tokenId)
        .send({ from: defaultAccount });

      const auctionPrice = ethers.utils.parseUnits(String(price), "ether");
      console.log(auctionPrice);

      await marketContract.methods
        .listToken(MyNFTContractAddress.MyNFT, tokenId, auctionPrice)
        .send({ from: defaultAccount });
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  });
};

export const uploadToIpfs = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const added = await client.add(file, {
      progress: (prog) => console.log(`received: ${prog}`),
    });
    return `https://ipfs.infura.io/ipfs/${added.path}`;
  } catch (error) {
    console.log("Error uploading file: ", error);
  }
};

export const getNfts = async (minterContract, marketContract) => {
  try {
    const nfts = [];
    const nftsLength = await marketContract.methods.getListingLength().call();
    for (let i = 0; i < Number(nftsLength); i++) {
      const nft = new Promise(async (resolve) => {
        const listing = await marketContract.methods.getListing(i).call();
        const res = await minterContract.methods
          .tokenURI(listing.tokenId)
          .call();
        const meta = await fetchNftMeta(res);
        const owner = await fetchNftOwner(minterContract, listing.tokenId);
        resolve({
          index: i,
          contractOwner: owner,
          owner: listing.owner,
          seller: listing.seller,
          price: listing.price,
          sold: listing.sold,
          token: listing.token,
          name: meta.data.name,
          image: meta.data.image,
          description: meta.data.description,
          attributes: meta.data.attributes,
        });
      });
      nfts.push(nft);
    }
    return Promise.all(nfts);
  } catch (e) {
    console.log({ e });
  }
};

export const fetchNftMeta = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null;
    const meta = await axios.get(ipfsUrl);
    return meta;
  } catch (e) {
    console.log({ e });
  }
};

export const fetchNftOwner = async (minterContract, index) => {
  try {
    return await minterContract.methods.ownerOf(index).call();
  } catch (e) {
    console.log({ e });
  }
};

export const fetchNftContractOwner = async (minterContract) => {
  try {
    let owner = await minterContract.methods.owner().call();
    return owner;
  } catch (e) {
    console.log({ e });
  }
};

export const buyNft = async (marketContract, performActions, index) => {
    try {
        await performActions(async (kit) => {
            try {
                console.log(marketContract, index);
              const { defaultAccount } = kit;
              const listing = await marketContract.methods.getListing(index).call();
        
              await marketContract.methods
                .buyToken(index)
                .send({ from: defaultAccount, value: listing.price });
            } catch (error) {
              console.log({ error });
            }
          }); 
    } catch (error) {
       console.log(error) 
    }
  
};
