require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
require('hardhat-deploy');
require('hardhat-contract-sizer');
require("hardhat-gas-reporter");
require('dotenv').config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const {
	ADDRESS_PRIVATE_KEY, 	// Private key used in deployment and testing
	ETH_MAIN_RPC, 			// RPCs for deployments, ETH_MAIN is also used for testing
	MATIC_RPC,
	ASTAR_RPC,
	SEPOLIA_RPC,
	AMOY_RPC,
	BASE_RPC,
	CORE_RPC,
	MINATO_RPC,
	COINMARKETCAP_API_KEY,
	ETHERSCAN_API_KEY,
	POLYGONSCAN_API_KEY,
	OKLINK_API_KEY,
	BASESCAN_API_KEY,
	BLOCKSCOUT_API_KEY,
	CORESCAN_API_KEY,
} = process.env;


const commonConfig = {
	accounts: [ADDRESS_PRIVATE_KEY]
}

module.exports = {
	networks: {
		// This blockchain will be used in the test cases
		hardhat: {
			forking: {
				url: ETH_MAIN_RPC,
				blockNumber: 20467191
			}
		},
		// The rest of the blockchains are for deployment
		"0x1": {
			url: ETH_MAIN_RPC,
			...commonConfig,
		},
		"0x89": {
			url: MATIC_RPC,
			...commonConfig,
		},
		"0x250": {
			url: ASTAR_RPC,
			...commonConfig,
		},
		"0xaa36a7": {
			url: SEPOLIA_RPC,
			...commonConfig,
		},
		"0x13882": {
			url: AMOY_RPC,
			...commonConfig,
		},
		"0x2105": {
			url: BASE_RPC,
			...commonConfig,
		},
		"0x45c": {
			url: CORE_RPC,
			...commonConfig,
		},
		"0x79a": {
			url: MINATO_RPC,
			...commonConfig,
		}
	},
	solidity: {
		compilers: [{
			// All code uses this version of Solidity compiler
			version: "0.8.25",
			settings: {
				optimizer: {
					enabled: true,
					runs: 200
				}
			}
		},{
			// Nick Mudge's diamond contracts use this version of the compiler
			version: "0.8.19",
			settings: {
				optimizer: {
					enabled: true,
					runs: 200
				}
			}
		}],
	},
	// Contract sizer tool, reports total size of compiled contracts
	contractSizer: {
		runOnCompile: true,
		strict: true
	},
	sourcify: {
		enabled: false,
	},
	mocha: {
		timeout: 0
	},
	gasReporter: {
		currency: 'USD',
		showTimeSpent: true,
		coinmarketcap: COINMARKETCAP_API_KEY || undefined
	},
	// Etherscan plugin takes care of verifying contracts on the block explorers.
	etherscan: {
		// Supported blockchains are here
		apiKey: {
			mainnet: ETHERSCAN_API_KEY,
			sepolia: ETHERSCAN_API_KEY, // This is correct, ETH and Sepolia share the same service

			polygon: POLYGONSCAN_API_KEY,
			polygonAmoy: OKLINK_API_KEY,

			base: BASESCAN_API_KEY,
			astar: BLOCKSCOUT_API_KEY,

			core: CORESCAN_API_KEY,
			minato: '???' // Any value should work
		},
		// Chains not supported by default are added here
		customChains: [
			{
				network: "astar",
				chainId: 592,
				urls: {
					apiURL: "https://astar.blockscout.com/api/",
					browserURL: "https://astar.blockscout.com/"
				}
			},
			{
				network: "core",
				chainId: 1116,
				urls: {
					apiURL: "https://openapi.coredao.org/api",
					browserURL: "https://scan.coredao.org/"
				}
			},
			{
				network: "minato",
				chainId: 1946,
				urls: {
					apiURL: "https://explorer-testnet.soneium.org/api/",
					browserURL: "https://explorer-testnet.soneium.org/"
				}
			},
		],
	}
};