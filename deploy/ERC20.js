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
			"0xEC30759D0A3F3CE0A730920DC29d74e441f492C3" 	// Juan - For testnets
		],
		deployerAddress
	);
};

module.exports.tags = ['ERC20'];