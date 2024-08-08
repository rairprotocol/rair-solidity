const { deployAndVerify } = require('../utilities/deployAndVerify');

module.exports = async ({ getUnnamedAccounts }) => {
	const [deployerAddress] = await getUnnamedAccounts();
	
	await deployAndVerify(
		'ERC20Exchange',
		[
			"0x2b0fFbF00388f9078d5512256c43B983BB805eF8" // ERC20 address
		],
		deployerAddress
	);
};

module.exports.tags = ['ERC20'];