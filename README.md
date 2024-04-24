# RAIR Smart Contracts
Source code and deployment scripts for RAIR smart contracts.
Notice: classic-contracts are deprecated

## Setup
Environment variables  

| Name | Description |
| --- | --- | 
| ETH_MAIN_RPC | RPC endpoint for Ethereum Mainnet |
| SEPOLIA_RPC | RPC endpoint for Ethereum Sepolia | 
| AMOY_RPC | RPC endpoint for Matic Amoy |
| MATIC_RPC | RPC endpoint for Matic Mainnet |
| BASE_RPC | RPC endpoint for Base Mainnet |
| ADDRESS_PRIVATE_KEY | Private key of the deployer wallet |
| COINMARKETCAP_API_KEY | API Key from coinmarketcap for hardhat's gas price estimations (optional) |
| ETHERSCAN_API_KEY | API key for Etherscan (used for verifying contracts) |
| POLYGONSCAN_API_KEY | API key for Polygonscan (used for verifying contracts) |

## Deploying
Inside the deploy directory you'll find the scripts for all of the diamond contract facets and the 3 main diamond contracts used by the RAIR system:  

| Contract | Description |
| --- | --- |
| Factory | In charge of deploying the ERC721 diamonds |
| Marketplace | Minting and resale offers |
| Facet Source | Diamond contract from which all ERC721 contracts get their facets |

The deployment process is automated, it is done thanks to hardhat-deploy and the verification is done through hardhat-verify.  All deployed contracts can be found in the "deployments" directory

## Testing
```npm run test``` will start the local testing on an ethereum mainnet fork, the main test script is under the "test" directory

## Setup
### Connecting the facets
Once all diamond facets are verified you'll need to connect them with the diamondCut function
* Necessary for all 3 contracts:
    * DiamondCutFacet
    * DiamondLoupeFacet
    * OwnershipFacet
* Addresses for Factory
    * CreatorsFacet
	* DeployerFacet
	* TokensFacet
    * PointsDeposit
	* PointsQuery
	* PointsWithdraw
* Addresses for Marketplace
    * MintingOffersFacet
    * FeesFacet
    * ResaleFacet
* Addresses for the ERC721 source
    * ERC721EnumerableFacet
    * RAIRMetadataFacet
    * RAIRProductFacet
    * RAIRRangesFacet
    * RAIRRoyaltiesFacet

### Setup calls
| Functions | Description |
| --- | --- | 
| Factory.changeToken(ERC20 address, Price for deployment) | Configure the factory to use tokens from the ERC20 to deploy |
| Factory.setSourceFacet(Facet source address) | Connect the factory to the main hub of diamond facets |
| Marketplace.updateTreasuryAddress(Treasury address) | Set the address for the treasury fees |
| Marketplace.updateTreasuryFee(Value) | Percentage the treasury will receive on every mint  |
| Marketplace.grantRole(RESALE_ADMIN, Signer address) | Approve an user address to generate resale hashes |