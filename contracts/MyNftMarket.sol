// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MyNftMarket {
	struct Listing {
		address payable seller;
        address payable owner;
		address token;
		uint tokenId;
		uint price;
        bool sold;
	}

	uint private _listingId = 0;
	mapping(uint => Listing) private _listings;

	function listToken(address token, uint tokenId, uint price) external {
		IERC721(token).transferFrom(msg.sender, address(this), tokenId);

		Listing memory listing = Listing(
			payable(msg.sender),
            payable(address(0)),
			token,
			tokenId,
			price,
            false
		);
		_listings[_listingId] = listing;
		_listingId++;

	}

	function getListing(uint listingId) public view returns (Listing memory) {
		return _listings[listingId];
	}

    function getListingLength()public view returns (uint){
        return _listingId;
    }

	function buyToken(uint listingId) public payable {
		Listing storage listing = _listings[listingId];

		require(msg.value == listing.price, "Insufficient payment");

		IERC721(listing.token).transferFrom(address(this), msg.sender, listing.tokenId);
		payable(listing.seller).transfer(msg.value);

        listing.sold = true;
        listing.price = listing.price * 2;
        listing.owner = payable(msg.sender);

	}
}