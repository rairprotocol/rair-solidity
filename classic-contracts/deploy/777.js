const {deployments, ethers} = require('hardhat');

module.exports = async ({accounts, getUnnamedAccounts}) => {
	const {deploy} = deployments;
	const [deployerAddress] = await getUnnamedAccounts();
	const constructorArguments =  [
		// Initial supply: 222 million - 222,000,000.000000000000000000
		'222000000000000000000000000',
		// Maximum supply: 400 million - 400,000,000.000000000000000000
		'400000000000000000000000000',
		// Initial Supply recipient and DEFAULT_ADMIN_ROLE holder (can grant the MINTER role)
		'0xf3FC93b77A1A39610aa800734dfD017Ca293e53d', // Garret's address
		// Default Operators (Can move tokens around without an explicit approval)
		[
			// List of addresses
		]
	];
	const deploymentTransaction = await deploy('RAIR777', {
		from: deployerAddress,
		args: constructorArguments
	});
	console.log('New ERC777 deployed at', deploymentTransaction.receipt.contractAddress);

	if (deploymentTransaction.newlyDeployed) {
		await hre.run("verify:verify", {
			address: deploymentTransaction.receipt.contractAddress,
			constructorArguments: constructorArguments
		});
	}
};

module.exports.tags = ['ERC777'];