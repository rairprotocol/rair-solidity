// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.25; 

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ResaleStorage } from "../Storage/ResaleStorage.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import { AccessControlAppStorageEnumerableMarket } from "../AppStorage.sol";
import { SignedHashProtection } from "../../common/SignedHashProtection.sol";

/// @title  RAIR Diamond - Resale Marketplace facet
/// @notice Facet in charge of transfering NFTs and funds
/// @author Juan M. Sanchez M.
/// @dev 	Uses signed messages for gasless offer postings
contract ResaleFacet is AccessControlAppStorageEnumerableMarket, SignedHashProtection {
	bytes32 private constant CREATOR = keccak256("CREATOR");
	bytes32 private constant DEFAULT_ADMIN_ROLE = 0x0;
	bytes32 public constant MAINTAINER = keccak256("MAINTAINER");
	bytes32 public constant RESALE_ADMIN = keccak256("RESALE_ADMIN");

    event TokenSold(address erc721Address, address buyer, address seller, uint token, uint tokenPrice);
    event TokenOfferCreated(address erc721Address, address seller, uint token, uint tokenPrice, uint offerId);
    event TokenOfferUpdated(uint offerId, uint newTokenPrice);
    event TokenOfferDeleted(uint offerId);
    
    modifier onlyOwnerOfContract(address erc721) {
        ResaleStorage.Layout storage data = ResaleStorage.layout();
        require(
            AccessControlAppStorageEnumerableMarket(erc721).hasRole(CREATOR, msg.sender) ||
            AccessControlAppStorageEnumerableMarket(erc721).hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Resale: Only the owner of a contract can set custom royalties"
        );
        _;
    }

    function setPurchaseGracePeriod (uint value) public onlyRole(MAINTAINER) {
        ResaleStorage.layout().purchaseGracePeriod = value;
    }

    function setDecimalPow (uint value) public onlyRole(MAINTAINER) {
        ResaleStorage.layout().decimalPow = value;
    }

    function setRoyalties(
      address erc721,
      ResaleStorage.feeSplits[] calldata fees
    ) onlyOwnerOfContract(erc721)
      external
    {
        for (uint i = 0; i < fees.length; i++) {
            ResaleStorage.layout().royaltySplits[erc721].push(fees[i]);
        }
    }

    function getRoyalties(address erc721) public view returns (ResaleStorage.feeSplits[] memory) {
        return ResaleStorage.layout().royaltySplits[erc721];
    }

    function roundedTime() internal view returns (uint time) {
        // Round out by 2 digits
        time = (block.timestamp / 100) * 100;
        time += ResaleStorage.layout().purchaseGracePeriod;
    }

    function generateResaleHash (
      address erc721,
      address buyer,
      address seller,
      uint token,
      uint tokenPrice,
      address nodeAddress
    ) public view returns (bytes32) {
        require(
            IERC721(erc721).isApprovedForAll(seller, address(this)) ||
            IERC721(erc721).getApproved(token) == address(this),
            "Resale: Marketplace isn't approved for transfers"
        );
        return keccak256(
            abi.encodePacked(
                erc721,
                buyer,
                seller,
                token,
                tokenPrice,
                nodeAddress,
                roundedTime()
            )
        );
    }

    function _sendToken(
        address erc721,
        uint token,
        address seller,
        address buyer,
        uint tokenPrice
    ) internal {
        IERC721(erc721).transferFrom(seller, buyer, token);
        emit TokenSold(erc721, buyer, seller, token, tokenPrice);
    }

    function transferCheck(
        address targetAddress,
        uint amount
    ) internal {
        (bool sent, ) = payable(targetAddress).call{value: amount}("");
        require(sent, "Resale: Transfer failed");
    }

    function _distributeFees(
        address erc721,
        uint tokenPrice,
        address nodeAddress,
        address seller
    ) internal {
        ResaleStorage.feeSplits[] storage royaltyData = ResaleStorage.layout().royaltySplits[erc721];
        require(tokenPrice <= msg.value, "Resale: Insufficient funds!");
        uint leftoverForSeller = tokenPrice;
        if (msg.value - tokenPrice > 0) {
            transferCheck(msg.sender, msg.value - tokenPrice);
        }

        uint toPay = tokenPrice * s.nodeFee / (100 * s.decimalPow);
        transferCheck(nodeAddress, toPay);
        uint totalTransferred = toPay;
        leftoverForSeller -= toPay;

        toPay = tokenPrice * s.treasuryFee / (100 * s.decimalPow);
        transferCheck(s.treasuryAddress, toPay);
        totalTransferred += toPay;
        leftoverForSeller -= toPay;

        for (uint i = 0; i < royaltyData.length; i++) {
            toPay = tokenPrice * royaltyData[i].percentage / (100 * s.decimalPow);
            transferCheck(royaltyData[i].recipient, toPay);
            totalTransferred += toPay;
            leftoverForSeller -= toPay;
        }
        transferCheck(seller, leftoverForSeller);
        totalTransferred += leftoverForSeller;
        require(totalTransferred == tokenPrice, "Resale: Error transferring funds!");
    }

    function createGasTokenOffer(
        address erc721,
        uint token,
        uint tokenPrice,
        address nodeAddress
    ) public {
        require(
            IERC721(erc721).ownerOf(token) == msg.sender,
            "Resale: Not the current owner of the token"
        );
		ResaleStorage.resaleOffer storage newOffer = ResaleStorage.layout().resaleOffers.push();
        newOffer.erc721 = erc721;
        newOffer.seller = msg.sender;
        newOffer.token = token;
        newOffer.tokenPrice = tokenPrice;
        newOffer.nodeAddress = nodeAddress;
        emit TokenOfferCreated(
            newOffer.erc721,
            newOffer.seller,
            newOffer.token,
            newOffer.tokenPrice,
            ResaleStorage.layout().resaleOffers.length - 1
        );
    }

    function updateGasTokenOffer(
        uint offerIndex,
        uint newPrice
    ) public {
        ResaleStorage.resaleOffer storage offer = ResaleStorage.layout().resaleOffers[offerIndex];
        require(
            IERC721(offer.erc721).ownerOf(offer.token) == msg.sender,
            "Resale: Not the current owner of the token"
        );
        offer.tokenPrice = newPrice;
        emit TokenOfferUpdated(offerIndex, offer.tokenPrice);
    }

    function deleteGasTokenOffer(
        uint offerIndex
    ) public {
        ResaleStorage.resaleOffer storage offer = ResaleStorage.layout().resaleOffers[offerIndex];
        require(
            IERC721(offer.erc721).ownerOf(offer.token) == msg.sender,
            "Resale: Not the current owner of the token"
        );
        offer.erc721 = address(0);
        emit TokenOfferDeleted(offerIndex);
    }

    function getResaleOffer(
        uint offerIndex
    ) public view returns (ResaleStorage.resaleOffer memory offer) {
        offer = ResaleStorage.layout().resaleOffers[offerIndex];
    }

    function purchaseGasTokenOffer(
        uint offerIndex
    ) public payable {
        ResaleStorage.resaleOffer storage offerData = ResaleStorage.layout().resaleOffers[offerIndex];
        require(
            offerData.buyer == address(0),
            "Resale: Offer already purchased"
        );
        _distributeFees(
            offerData.erc721,
            offerData.tokenPrice,
            offerData.nodeAddress,
            offerData.seller
        );
        _sendToken(
            offerData.erc721,
            offerData.token,
            offerData.seller,
            msg.sender,
            offerData.tokenPrice
        );
        offerData.buyer = msg.sender;
    }

    function purchaseTokenOffer(
        address erc721,
        address buyer,
        address seller,
        uint token,
        uint tokenPrice,
        address nodeAddress,
        bytes memory signature
    ) public payable {
        bytes32 messageHash = generateResaleHash(erc721, buyer, seller, token, tokenPrice, nodeAddress);
        bytes32 ethSignedMessageHash = getSignedMessageHash(messageHash);
        require(
            hasRole(RESALE_ADMIN, recoverSigner(ethSignedMessageHash, signature)),
            "Resale: Invalid withdraw request"
        );

        _distributeFees(erc721, tokenPrice, nodeAddress, seller);
        _sendToken(erc721, token, seller, buyer, tokenPrice);
    }
}