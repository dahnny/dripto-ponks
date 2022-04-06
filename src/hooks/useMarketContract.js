import { useContract } from "./useContract";
import MyNftMarketAbi from "../contracts/MyNFTMarket.json";
import MyNFTContractAddress from "../contracts/MyNFTMarket-address.json";

export const useMarketContract = () =>
  useContract(MyNftMarketAbi.abi, MyNFTContractAddress.MyNFTMarket);
