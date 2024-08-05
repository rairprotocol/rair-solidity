// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.25;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SignedHashProtection } from "../common/SignedHashProtection.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

contract ERC20Exchange is ERC721, AccessControl, SignedHashProtection {
    using Strings for uint256;
	bytes32 public constant ADMIN = keccak256("rair.exchange.admin");

    address currentERC20;
    uint purchasePeriod;
    string baseURI;
    string metadataExtension;

    constructor(address erc20) ERC721("RAIRprotocol", "NOTICE") {
        _setRoleAdmin(ADMIN, ADMIN);
		_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
		_grantRole(ADMIN, msg.sender);
        currentERC20 = erc20;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl) returns (bool) {
        return
            super.supportsInterface(interfaceId);
    }

    function updateERC20Address(address erc20address) public onlyRole(ADMIN) {
        currentERC20 = erc20address;
    }

    function roundedTime() internal view returns (uint time) {
        // Round out by 2 digits
        time = (block.timestamp / 100) * 100;
        time += purchasePeriod;
    }

    function setPurchasePeriod(uint newTime) public onlyRole(ADMIN) {
        purchasePeriod = newTime;
    }

    function generateLicenseHash (
      uint index,
      address buyer,
      uint erc20Price
    ) public view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                index,
                buyer,
                erc20Price,
                roundedTime()
            )
        );
    }

    function mint(uint index, uint erc20Price, bytes memory licenseHash) public {
        bytes32 messageHash = generateLicenseHash(index, msg.sender, erc20Price);
        bytes32 ethSignedMessageHash = getSignedMessageHash(messageHash);
        require(
            hasRole(ADMIN, recoverSigner(ethSignedMessageHash, licenseHash)),
            "License Mint: Invalid signature"
        );
        IERC20(currentERC20).transferFrom(msg.sender, address(this), erc20Price);
        _safeMint(msg.sender, index);
    }

    function metadataConfig(string memory uri, string memory extension) public onlyRole(ADMIN) {
        baseURI = uri;
        metadataExtension = extension;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return bytes(baseURI).length > 0 ? string.concat(
            baseURI,
            tokenId.toString(),
            metadataExtension
        ) : "";
    }
}