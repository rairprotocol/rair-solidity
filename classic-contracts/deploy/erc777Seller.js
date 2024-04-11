const {deployments, ethers} = require('hardhat');

module.exports = async ({accounts, getUnnamedAccounts}) => {
	const { deploy, get } = deployments;
	const [deployerAddress] = await getUnnamedAccounts();

	// Selects the address for the ERC777 depending on the blockhain
	let constructorArgumentsForSeller = [
		// Address for ERC777
	];
	
	if (constructorArgumentsForSeller[0] === undefined) {
		console.error("NO ERC777 CONTRACT DEFINED");
		return;
	}
	
	//let newSellerDeployment = await get("RAIR_Token_Purchaser");
	let newSellerDeployment = (await deploy(
		"RAIR_Token_Purchaser",
		{
			from: deployerAddress,
			args: constructorArgumentsForSeller,
			waitConfirmations: 6
		}
	))

	if (!newSellerDeployment) {
		console.log('ERROR DEPLOYING');
		return
	}

	console.error(`Deployed ERC777 seller contract on ${hre.network.name}, address: ${newSellerDeployment?.receipt?.contractAddress}`);

	if (newSellerDeployment.newlyDeployed) {
		await hre.run("verify:verify", {
			address: newSellerDeployment.receipt.contractAddress,
			constructorArguments: constructorArgumentsForSeller
		});
	}

	console.log('Complete!');
};

module.exports.tags = ['ERC777Seller'];