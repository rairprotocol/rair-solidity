const {deployments, ethers} = require('hardhat');

module.exports = async ({accounts, getUnnamedAccounts}) => {
	const {deploy} = deployments;
	const [deployerAddress] = await getUnnamedAccounts();

	let contractArgs = [
		// Treasury address
	]

	let deployment = await deploy("Resale_MarketPlace", {
		args: contractArgs,
		from: deployerAddress,
		waitConfirmations: 6
	});
	console.log(`Resale Marketplace deployed at ${deployment.receipt.contractAddress}`);
	if (deployment.newlyDeployed) {
		try {
			await hre.run("verify:verify", {
				address: deployment.receipt.contractAddress,
				constructorArguments: contractArgs,
			});
		} catch (err) {
			console.error(err);
		}
	}
};

module.exports.tags = ['ResaleMarketplace'];