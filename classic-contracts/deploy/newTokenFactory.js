const {deployments, ethers} = require('hardhat');

module.exports = async ({accounts, getUnnamedAccounts}) => {
	const { deploy, get } = deployments;
	const [deployerAddress] = await getUnnamedAccounts();

	// Selects the address for the ERC777 depending on the blockhain
	let constructorArgumentsForNewFactory = [
		'15000000000000000000',			// Deployments are by default 15 RAIR tokens
		// Address for ERC777
	];
	
	if (constructorArgumentsForNewFactory[1] === undefined) {
		console.error("NO ERC777 CONTRACT DEFINED");
		return;
	}
	
	//let newFactoryDeployment = await get("RAIR721_Master_Factory");
	let newFactoryDeployment = (await deploy(
		"RAIR721_Master_Factory",
		{
			from: deployerAddress,
			args: constructorArgumentsForNewFactory,
			waitConfirmations: 6
		}
	))

	if (!newFactoryDeployment) {
		console.log('ERROR DEPLOYING');
		return
	}

	console.error(`Deployed Master Factory contract on ${hre.network.name}, address: ${newFactoryDeployment?.receipt?.contractAddress}`);

	let constructorArgumentsForDeployer = [ newFactoryDeployment.receipt.contractAddress ];

	let newDeployerDeployment = (await deploy(
		"RAIR721_Deployer",
		{
			from: deployerAddress,
			args: constructorArgumentsForDeployer,
			waitConfirmations: 6
		}
	))

	if (!newDeployerDeployment) {
		console.error('ERROR DEPLOYING DEPLOYING CONTRACT');
		return
	}

	console.log(`Deployed Factory Deployer contract on ${hre.network.name}, address: ${newDeployerDeployment?.receipt?.contractAddress}`);

	if (newFactoryDeployment.newlyDeployed) {
		await hre.run("verify:verify", {
			address: newFactoryDeployment.receipt.contractAddress,
			constructorArguments: constructorArgumentsForNewFactory
		});
	}

	if (newDeployerDeployment.newlyDeployed) {
		await hre.run("verify:verify", {
			address: newDeployerDeployment.receipt.contractAddress,
			constructorArguments: constructorArgumentsForDeployer
		});
	}

	console.log('Complete!');
};

module.exports.tags = ['NewTokenFactory'];