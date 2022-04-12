// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721, Ownable, ERC721Enumerable, ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    address contractAddress;

    constructor(address marketplace) ERC721("Dripto Ponks", "DPT") {
        contractAddress = marketplace;
    }

    uint256 _tokenId = 0;

    function mint(string memory uri) external returns (uint256) {
        _tokenId++;
        _mint(msg.sender, _tokenId);
        _setTokenURI(_tokenId, uri);
        setApprovalForAll(contractAddress, true);
        return _tokenId;
    }

    function resaleApproval(uint256 tokenId) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "You must own this NFT in order to resell it"
        );
        setApprovalForAll(contractAddress, true);
        return;
    }

    function getTokenId() external view returns (uint256) {
        return _tokenId;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
