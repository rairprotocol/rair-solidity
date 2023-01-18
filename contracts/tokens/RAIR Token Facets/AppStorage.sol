// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.11; 

import '../../common/AccessControlEnumerable.sol';

struct range {
	uint rangeStart;
	uint rangeEnd;
	uint tokensAllowed;
	uint mintableTokens;
	uint lockedTokens;
	uint rangePrice;
	string rangeName;
}

struct product {
	uint startingToken;
	uint endingToken;
	uint mintableTokens;
	string name;
	uint[] rangeList;
}

struct AppStorage721 {
	// ERC721
	string _name;
	string _symbol;
	mapping(uint256 => address) _owners;
	mapping(address => uint256) _balances;
	mapping(uint256 => address) _tokenApprovals;
	mapping(address => mapping(address => bool)) _operatorApprovals;
	// ERC721 Enumerable
	mapping(address => mapping(uint256 => uint256)) _ownedTokens;
	mapping(uint256 => uint256) _ownedTokensIndex;
	uint256[] _allTokens;
	mapping(uint256 => uint256) _allTokensIndex;
	// Access Control Enumerable
	mapping(bytes32 => RoleData) _roles;
	mapping(bytes32 => EnumerableSet.AddressSet) _roleMembers;
	// App
	string baseURI;
	address factoryAddress;
	uint16 royaltyFee;
	product[] products;
	range[] ranges;
	mapping(uint => uint) tokenToProduct;
	mapping(uint => uint) tokenToRange;
	mapping(uint => string) uniqueTokenURI;
	mapping(uint => string) productURI;
	mapping(uint => bool) appendTokenIndexToProductURI;
	bool appendTokenIndexToBaseURI;
	mapping(uint => uint[]) tokensByProduct;
	string contractMetadataURI;
	mapping(uint => uint) rangeToProduct;
	mapping(uint => bool) _minted;
	// August 2022 - Metadata File Extension Update
	mapping(uint => string) rangeURI;
	mapping(uint => bool) appendTokenIndexToRangeURI;
	string _metadataExtension;
	// Always add new variables at the end of the struct
}

library LibAppStorage721 {
	/// @notice this funtion set the storage of the diamonds 721 contracts 
	function diamondStorage() internal pure	returns (AppStorage721 storage ds) {
		assembly {
			ds.slot := 0
		}
	}
}

/// @title  This is contract to manage the access control of the RAIR token facet
/// @notice You can use this contract to administrate roles of the app market
/// @author Juan M. Sanchez M.
/// @dev 	Notice that this contract is inheriting from Context
contract AccessControlAppStorageEnumerable721 is Context, AccessControlEnumerable {
	using EnumerableSet for EnumerableSet.AddressSet;
	
	AppStorage721 internal s;

	/// @notice Allow us to check the if and account has a selected role
	/// @param 	role Contains the role that we want to verify
	/// @param 	account Contains the account address thay we want to verify
	/// @return bool that indicates if an account has or not a role
	function hasRole(bytes32 role, address account) public view override returns (bool) {
		return s._roles[role].members[account];
	}

	/// @notice Allow us to check the admin role that contains a role
	/// @param 	role Contains the role that we want to verify
	/// @return bytes that indicates if an account has or not an admin role
	function getRoleAdmin(bytes32 role) public view override returns (bytes32) {
		return s._roles[role].adminRole;
	}

	/// @notice Allow us to check the address of an indexed position for the role list
	/// @param 	role Contains the role that we want to verify
	/// @param 	index Contains the indexed position to verify inside the role members list
	/// @return address that indicates the address indexed in that position
	function getRoleMember(bytes32 role, uint256 index) public view override returns (address) {
		return s._roleMembers[role].at(index);
	}

	/// @notice Allow us to check total members that has an selected role
	/// @param 	role Contains the role that we want to verify
	/// @return uint256 that indicates the total accounts with that role
	function getRoleMemberCount(bytes32 role) public view override returns (uint256) {
		return s._roleMembers[role].length();
	}

	/// @notice Allow us to modify a rol and set it as an admin role
	/// @param 	role Contains the role that we want to modify
	/// @param 	adminRole Contains the admin role that we want to set
	function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal override {
		bytes32 previousAdminRole = getRoleAdmin(role);
		s._roles[role].adminRole = adminRole;
		emit RoleAdminChanged(role, previousAdminRole, adminRole);
	}

	/// @notice Allow us to revoke a role to an account
	/// @param 	role Contains the role that we want to revoke
	/// @param 	account Contains the account that has the role we want to update
	function _revokeRole(bytes32 role, address account) internal override {
		if (hasRole(role, account)) {
			s._roles[role].members[account] = false;
			emit RoleRevoked(role, account, _msgSender());
			s._roleMembers[role].remove(account);
		}
	}

	/// @notice Allow us to grant a new role to an account
	/// @dev 	Notice that this function override the behavior of
	/// @dev 	the _grantRole function inherited from AccessControlEnumerable
	/// @param 	role Contains the facet addresses and function selectors
    /// @param 	account Contains the facet addresses and function selectors
	function _grantRole(bytes32 role, address account) internal override {
		if (!hasRole(role, account)) {
			s._roles[role].members[account] = true;
			emit RoleGranted(role, account, _msgSender());
			s._roleMembers[role].add(account);
		}
	}
}