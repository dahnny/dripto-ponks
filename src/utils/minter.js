import {create} from "ipfs-http-client";
import axios from "axios";
import MyNFTContractAddress from "../contracts/MyNFT-address.json";
import { BigNumber, ethers } from "ethers";

const authorization =
    "Basic " +
    Buffer.from(
        process.env.REACT_APP_PROJECT_ID +
        ":" +
        process.env.REACT_APP_PROJECT_SECRET
    ).toString("base64");

const client = create({ url: "https://ipfs.infura.io:5001/api/v0", headers: { authorization } });

export const createNft = async (
  minterContract,
  marketContract,
  performActions,
  { name, price, description, ipfsImage, attributes }
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
      const url = `https://diac.ipfs.infura.io/ipfs/${added.path}`;

      // mint the NFT and save the IPFS url to the blockchain
      let tx = await minterContract.methods
        .mint(url)
        .send({ from: defaultAccount });
      let tokenId = BigNumber.from(tx.events.Transfer.returnValues.tokenId);

      const auctionPrice = ethers.utils.parseUnits(String(price), "ether");

      await marketContract.methods
        .listToken(MyNFTContractAddress.MyNFT, tokenId, auctionPrice)
        .send({ from: defaultAccount });
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  });
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
          tokenId: listing.tokenId,
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

export const buyNft = async (
  minterContract,
  marketContract,
  performActions,
  index,
  tokenId
) => {
  try {
    await performActions(async (kit) => {
      try {
        console.log(marketContract, index);
        const { defaultAccount } = kit;
        const listing = await marketContract.methods.getListing(index).call();
        await marketContract.methods
          .buyToken(index)
          .send({ from: defaultAccount, value: listing.price });
        await minterContract.methods.resaleApproval(tokenId).send({from: defaultAccount})
      } catch (error) {
        console.log({ error });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
