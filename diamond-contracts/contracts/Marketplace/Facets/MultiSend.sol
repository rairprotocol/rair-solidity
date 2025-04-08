// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.25; 

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';

/// @title  RAIR Diamond - Multi send facet
/// @notice Tool to send multiple ERC20 tokens
contract MultiSendTool {
    function _multiSendSameAmount(
        address erc20Address,
        address sender,
        address payable[] calldata recipients,
        uint amount
    ) internal {
        IERC20 token = IERC20(erc20Address);
		for (uint i = 0; i < recipients.length; i++) {
            token.transferFrom(sender, recipients[i], amount);
        }
    }

    function _multiSend(
        address erc20Address,
        address sender,
        address payable[] calldata recipients,
        uint[] calldata amounts
    ) internal {
        require(recipients.length == amounts.length, "MultiSend: Invalid array sizes");
        IERC20 token = IERC20(erc20Address);
		for (uint i = 0; i < recipients.length; i++) {
            token.transferFrom(sender, recipients[i], amounts[i]);
        }
    }

	function multiSendERC20(
        address erc20Address,
        address payable[] calldata recipients,
        uint[] calldata amounts
    ) external {
        _multiSend(
            erc20Address,
            msg.sender,
            recipients,
            amounts
        );
	}

    function multiSendERC20From(
        address erc20Address,
        address sender,
        address payable[] calldata recipients,
        uint[] calldata amounts
    ) external {
        _multiSend(
            erc20Address,
            sender,
            recipients,
            amounts
        );
	}

    function multiSendERC20SameAmount(
        address erc20Address,
        address payable[] calldata recipients,
        uint amount
    ) external {
        _multiSendSameAmount(
            erc20Address,
            msg.sender,
            recipients,
            amount
        );
	}

    function multiSendERC20FromSameAmount(
        address erc20Address,
        address sender,
        address payable[] calldata recipients,
        uint amount
    ) external {
        _multiSendSameAmount(
            erc20Address,
            sender,
            recipients,
            amount
        );
	}
}