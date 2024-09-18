const { deployAndVerify } = require('../utilities/deployAndVerify');
const { utils } = require('ethers');

module.exports = async ({ getUnnamedAccounts }) => {
	const [deployerAddress] = await getUnnamedAccounts();
	
	await deployAndVerify(
		'RAIR20',
		[
			"RAIR", 										// Name
			"RAIR", 										// Symbol
			utils.parseUnits('1000000000', 18), 			// Initial supply
			// 0x00000000000000000000						// Owner address!
		],
		deployerAddress
	);
};

module.exports.tags = ['ERC20'];