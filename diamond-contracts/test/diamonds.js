const { expect } = require("chai");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const {
	getSelectors,
	FacetCutAction_ADD,
	FacetCutAction_REPLACE,
	FacetCutAction_REMOVE
} = require('../utilities/diamondUtils');

const initialRAIR20Supply = 10000;
const priceToDeploy = 150;

// Expected deployment addresses
let firstDeploymentAddress;
let secondDeploymentAddress;

let usedSelectorsForFactory = {};
let usedSelectorsForMarketplace = {};

describe("Diamonds", function () {
	let owner, addr1, addr2, addr3, addr4, treasuryAddress, nodeAddress, addrs;

	let FactoryDiamondFactory, factoryDiamondInstance;
	let MarketDiamondFactory, marketDiamondInstance;
	
	let DiamondCutFacetFactory, diamondCutFacetInstance;
	let OwnershipFacetFactory, ownershipFacetInstance;
	let DiamondLoupeFacetFactory, diamondLoupeFacetInstance;

	let DeployerFacetFactory, deployerFacetInstance;
	let CreatorsFacetFactory, creatorsFacetInstance;
	let TokensFacetFactory, tokensFacetInstance;

	let ERC20Factory, erc20Instance, extraERC20Instance;

	let ERC721FacetFactory, erc721FacetInstance;
	let RAIRMetadataFacetFactory, rairMetadataFacetInstance;
	let RAIRProductFacetFactory, rairProductFacetInstance;
	let RAIRRangesFacetFactory, rairRangesFacetInstance;
	let RAIRRoyaltiesFacetFactory, rairRoyaltiesFacetInstance;

	let MintingOffersFacetFactory, mintingOfferFacetsInstance;
	let FeesFacetFactory, feesFacetInstance;
	let ResaleFacetFactory, resaleFacetInstance;

	let ReceiveEthAttackerFactory, receiveEthAttackerInstance;

	let PointsDepositFactory, pointsDepositInstance;
	let PointsQueryFactory, pointsQueryInstance;
	let PointsWithdrawFactory, pointsWithdrawInstance;

	let FacetSourceFactory, facetSourceInstance;

	let ExchangeFactory, exchangeInstance;

	let MultiSendFacetFactory, multiSendFacetInstance;

	beforeEach(async () => {
		//console.log(ethers.utils.formatEther(await ethers.provider.getBalance(owner.address)));
	})
	
	before(async () => {
		[
			owner,
			addr1,
			addr2,
			addr3,
			addr4,
			treasuryAddress,
			nodeAddress,
			...addrs
		] = await ethers.getSigners();
		// Nick Mudge's facets
		DiamondCutFacetFactory = await ethers.getContractFactory("DiamondCutFacet");
		OwnershipFacetFactory = await ethers.getContractFactory("OwnershipFacet");
		DiamondLoupeFacetFactory = await ethers.getContractFactory("DiamondLoupeFacet");
		
		// ERC20 Deployment (RAIR Token)
		ERC20Factory = await ethers.getContractFactory("RAIR20");
		// Factory
		FactoryDiamondFactory = await ethers.getContractFactory("FactoryDiamond");
		// Marketplace
		MarketDiamondFactory = await ethers.getContractFactory("MarketplaceDiamond");

		// Factory's facets
		DeployerFacetFactory = await ethers.getContractFactory("DeployerFacet");
		CreatorsFacetFactory = await ethers.getContractFactory("CreatorsFacet");
		TokensFacetFactory = await ethers.getContractFactory("TokensFacet");
		PointsDepositFactory = await ethers.getContractFactory("PointsDeposit");
		PointsQueryFactory = await ethers.getContractFactory("PointsQuery");
		PointsWithdrawFactory = await ethers.getContractFactory("PointsWithdraw");

		// Facet source for ERC721 contract
		FacetSourceFactory = await ethers.getContractFactory("FacetSource");

		// ERC721's Facets
		ERC721FacetFactory = await ethers.getContractFactory("ERC721EnumerableFacet");
		RAIRMetadataFacetFactory = await ethers.getContractFactory("RAIRMetadataFacet");
		RAIRProductFacetFactory = await ethers.getContractFactory("RAIRProductFacet");
		RAIRRangesFacetFactory = await ethers.getContractFactory("RAIRRangesFacet");
		RAIRRoyaltiesFacetFactory = await ethers.getContractFactory("RAIRRoyaltiesFacet");

		// Marketplace's Facets
		MintingOffersFacetFactory = await ethers.getContractFactory("MintingOffersFacet");
		FeesFacetFactory = await ethers.getContractFactory("FeesFacet");
		ResaleFacetFactory = await ethers.getContractFactory("ResaleFacet");

		// Malicious contracts for testing
		ReceiveEthAttackerFactory = await ethers.getContractFactory("ReceiveEthAttacker");
		ExchangeFactory = await ethers.getContractFactory("ERC20Exchange");

		// Multi send tool (part of marketplace)
		MultiSendFacetFactory = await ethers.getContractFactory("MultiSendTool");
	});

	describe("Deploying normal contracts", () => {
		it ("Should deploy two ERC20 contracts", async () => {
			erc20Instance = await ERC20Factory.deploy("RAIR One", "RAIR1", initialRAIR20Supply, owner.address);
			extraERC20Instance = await ERC20Factory.deploy("RAIR Two", "RAIR2", initialRAIR20Supply / 2, owner.address);
			await erc20Instance.deployed();
			await extraERC20Instance.deployed();
		});

		it ("Should deploy the License Exchange", async () => {
			exchangeInstance = await ExchangeFactory.deploy(extraERC20Instance.address);
			await exchangeInstance.deployed();
		});
	});

	describe("Deploying the Diamond Contract", () => {
		it ("Should deploy the diamondCut facet", async () => {
			diamondCutFacetInstance = await DiamondCutFacetFactory.deploy();
			await diamondCutFacetInstance.deployed();
		});

		it ("Should deploy the base Factory Diamond", async () => {
			factoryDiamondInstance = await FactoryDiamondFactory.deploy(diamondCutFacetInstance.address);
			await factoryDiamondInstance.deployed();
		});

		it ("Should deploy the base Facet Source", async () => {
			facetSourceInstance = await FacetSourceFactory.deploy(diamondCutFacetInstance.address);
			await factoryDiamondInstance.deployed();
		});

		it ("Should deploy the base Marketplace Diamond", async () => {
			marketDiamondInstance = await MarketDiamondFactory.deploy(diamondCutFacetInstance.address);
			await marketDiamondInstance.deployed();
		});

		it ("Should deploy the Diamond Ownership facet", async () => {
			ownershipFacetInstance = await OwnershipFacetFactory.deploy();
			await ownershipFacetInstance.deployed();
		});

		it ("Should deploy the Diamond Loupe facet", async () => {
			diamondLoupeFacetInstance = await DiamondLoupeFacetFactory.deploy();
			await diamondLoupeFacetInstance.deployed();
		});


		//// Custom Facets

		it ("Should deploy the Creators Facet", async() => {
			creatorsFacetInstance = await CreatorsFacetFactory.deploy();
			await creatorsFacetInstance.deployed();
		});

		it ("Should deploy the deployer facet", async () => {
			deployerFacetInstance = await DeployerFacetFactory.deploy();
			await deployerFacetInstance.deployed();
		});

		it ("Should deploy the Creators Facet", async() => {
			tokensFacetInstance = await TokensFacetFactory.deploy();
			await tokensFacetInstance.deployed();
		});

		it ("Should deploy the ERC721 Facet", async () => {
			erc721FacetInstance = await ERC721FacetFactory.deploy();
			await erc721FacetInstance.deployed();
		});

		it ("Should deploy the RAIR Ranges Facet", async () => {
			rairRangesFacetInstance = await RAIRRangesFacetFactory.deploy();
			await rairRangesFacetInstance.deployed();
		});

		it ("Should deploy the RAIR Royalties Facet", async () => {
			rairRoyaltiesFacetInstance = await RAIRRoyaltiesFacetFactory.deploy();
			await rairRoyaltiesFacetInstance.deployed();
		});

		it ("Should deploy the RAIR Metadata Facet", async () => {
			rairMetadataFacetInstance = await RAIRMetadataFacetFactory.deploy();
			await rairMetadataFacetInstance.deployed();
		});

		it ("Should deploy the RAIR Product Facet", async () => {
			rairProductFacetInstance = await RAIRProductFacetFactory.deploy();
			await rairProductFacetInstance.deployed();
		});

		// Marketplace Custom Facets
		it ("Should deploy the Market Minting Offers Facet", async () => {
			mintingOfferFacetsInstance = await MintingOffersFacetFactory.deploy();
			await mintingOfferFacetsInstance.deployed();
		});

		it ("Should deploy the Fees Facet", async () => {
			feesFacetInstance = await FeesFacetFactory.deploy();
			await feesFacetInstance.deployed();
		});

		it ("Should deploy the Resale Facet", async () => {
			resaleFacetInstance = await ResaleFacetFactory.deploy();
			await feesFacetInstance.deployed();
		});

		it ("Should deploy the Points Deposit Facet", async () => {
			pointsDepositInstance = await PointsDepositFactory.deploy();
			await pointsDepositInstance.deployed();
		});

		it ("Should deploy the Points Query Facet", async () => {
			pointsQueryInstance = await PointsQueryFactory.deploy();
			await pointsQueryInstance.deployed();
		});

		it ("Should deploy the Points Withdraw Facet", async () => {
			pointsWithdrawInstance = await PointsWithdrawFactory.deploy();
			await pointsWithdrawInstance.deployed();
		});

		it ("Should deploy the Points Withdraw Facet", async () => {
			multiSendFacetInstance = await MultiSendFacetFactory.deploy();
			await multiSendFacetInstance.deployed();
		});
	});

	describe("Adding facets to the Factory Diamond contract", () => {
		describe("Basic Diamond facets", () => {
			it ("Should add the ownership facet", async () => {
				let diamondCut = await ethers.getContractAt('IDiamondCut', factoryDiamondInstance.address);
				const ownershipCutItem = {
					facetAddress: ownershipFacetInstance.address,
					action: FacetCutAction_ADD,
					functionSelectors: getSelectors(ownershipFacetInstance, usedSelectorsForFactory)
				}
				await expect(await diamondCut.diamondCut([ownershipCutItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
					//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
	
				// Also add the facet to the Marketplace Diamond
				diamondCut = await ethers.getContractAt('IDiamondCut', marketDiamondInstance.address);
				await expect(await diamondCut.diamondCut([ownershipCutItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
				// Also add the facet to the Marketplace Diamond
				diamondCut = await ethers.getContractAt('IDiamondCut', facetSourceInstance.address);
				await expect(await diamondCut.diamondCut([ownershipCutItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
			});
	
			it ("Should add the Loupe facet", async () => {
				let diamondCut = await ethers.getContractAt('IDiamondCut', factoryDiamondInstance.address);
				const loupeFacetItem = {
					facetAddress: diamondLoupeFacetInstance.address,
					action: FacetCutAction_ADD,
					functionSelectors: getSelectors(diamondLoupeFacetInstance, usedSelectorsForFactory)
				}
				await expect(await diamondCut.diamondCut([loupeFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
					//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
	
				// Also add the facet to the Marketplace Diamond
				diamondCut = await ethers.getContractAt('IDiamondCut', marketDiamondInstance.address);
				await expect(await diamondCut.diamondCut([loupeFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
	
				// Also add the facet to the Marketplace Diamond
				diamondCut = await ethers.getContractAt('IDiamondCut', facetSourceInstance.address);
				await expect(await diamondCut.diamondCut([loupeFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
			});
		})

		describe("Factory Facets", () => {
			it ("Should add the Creators facet", async () => {
				const diamondCut = await ethers.getContractAt('IDiamondCut', factoryDiamondInstance.address);
				const creatorsFacetItem = {
					facetAddress: creatorsFacetInstance.address,
					action: FacetCutAction_ADD,
					functionSelectors: getSelectors(creatorsFacetInstance, usedSelectorsForFactory)
				}
				await expect(await diamondCut.diamondCut([creatorsFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
					//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
			});
	
			it ("Should add the Deployer facet", async () => {
				const diamondCut = await ethers.getContractAt('IDiamondCut', factoryDiamondInstance.address);
				const receiverFacetItem = {
					facetAddress: deployerFacetInstance.address,
					action: FacetCutAction_ADD,
					functionSelectors: getSelectors(deployerFacetInstance, usedSelectorsForFactory)
				}
				await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
					//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
			});
	
			it ("Should add the Tokens facet", async () => {
				const diamondCut = await ethers.getContractAt('IDiamondCut', factoryDiamondInstance.address);
				const receiverFacetItem = {
					facetAddress: tokensFacetInstance.address,
					action: FacetCutAction_ADD,
					functionSelectors: getSelectors(tokensFacetInstance, usedSelectorsForFactory)
				}
				await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
					//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
			});
		});

		describe("Facet Source facets", () => {
			it ("Should add the RAIR Metadata facet", async () => {
				const diamondCut = await ethers.getContractAt('IDiamondCut', facetSourceInstance.address);
				const receiverFacetItem = {
					facetAddress: rairMetadataFacetInstance.address,
					action: FacetCutAction_ADD,
					functionSelectors: getSelectors(rairMetadataFacetInstance, usedSelectorsForFactory)
				}
				await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
					//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
			});

			it ("Should add the ERC721 facet", async () => {
				const diamondCut = await ethers.getContractAt('IDiamondCut', facetSourceInstance.address);
				const receiverFacetItem = {
					facetAddress: erc721FacetInstance.address,
					action: FacetCutAction_ADD,
					functionSelectors: getSelectors(erc721FacetInstance, usedSelectorsForFactory)
				}
				await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
					//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
			});
	
			it ("Should add the RAIR Product facet", async () => {
				const diamondCut = await ethers.getContractAt('IDiamondCut', facetSourceInstance.address);
				const receiverFacetItem = {
					facetAddress: rairProductFacetInstance.address,
					action: FacetCutAction_ADD,
					functionSelectors: getSelectors(rairProductFacetInstance, usedSelectorsForFactory)
				}
				await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
					//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
			});
	
			it ("Should add the RAIR Ranges facet", async () => {
				const diamondCut = await ethers.getContractAt('IDiamondCut', facetSourceInstance.address);
				const receiverFacetItem = {
					facetAddress: rairRangesFacetInstance.address,
					action: FacetCutAction_ADD,
					functionSelectors: getSelectors(rairRangesFacetInstance, usedSelectorsForFactory)
				}
				await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
					//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
			});
	
			it ("Should add the RAIR Royalties facet", async () => {
				const diamondCut = await ethers.getContractAt('IDiamondCut', facetSourceInstance.address);
				const receiverFacetItem = {
					facetAddress: rairRoyaltiesFacetInstance.address,
					action: FacetCutAction_ADD,
					functionSelectors: getSelectors(rairRoyaltiesFacetInstance, usedSelectorsForFactory)
				}
				await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.emit(diamondCut, "DiamondCut");
					//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
			});
		});

		it("Should connect all points facets", async () => {
			const diamondCut = await ethers.getContractAt('IDiamondCut', factoryDiamondInstance.address);
			let receiverFacetItem = {
				facetAddress: pointsDepositInstance.address,
				action: FacetCutAction_ADD,
				functionSelectors: getSelectors(pointsDepositInstance, usedSelectorsForFactory)
			}
			await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
				.to.emit(diamondCut, "DiamondCut");
			
			receiverFacetItem = {
				facetAddress: pointsQueryInstance.address,
				action: FacetCutAction_ADD,
				functionSelectors: getSelectors(pointsQueryInstance, usedSelectorsForFactory)
			}
			await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
				.to.emit(diamondCut, "DiamondCut");
			
			receiverFacetItem = {
				facetAddress: pointsWithdrawInstance.address,
				action: FacetCutAction_ADD,
				functionSelectors: getSelectors(pointsWithdrawInstance, usedSelectorsForFactory)
			}
			await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
				.to.emit(diamondCut, "DiamondCut");
		});
	});

	describe("Adding facets to the Marketplace Diamond contract", () => {
		it ("Should add the Minting Offers facet", async () => {
			const diamondCut = await ethers.getContractAt('IDiamondCut', marketDiamondInstance.address);
			const receiverFacetItem = {
				facetAddress: mintingOfferFacetsInstance.address,
				action: FacetCutAction_ADD,
				functionSelectors: getSelectors(mintingOfferFacetsInstance, usedSelectorsForMarketplace)
			}
			await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
				.to.emit(diamondCut, "DiamondCut");
				//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
		});

		it ("Should add the Minting Offers facet", async () => {
			const diamondCut = await ethers.getContractAt('IDiamondCut', marketDiamondInstance.address);
			const receiverFacetItem = {
				facetAddress: feesFacetInstance.address,
				action: FacetCutAction_ADD,
				functionSelectors: getSelectors(feesFacetInstance, usedSelectorsForMarketplace)
			}
			await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
				.to.emit(diamondCut, "DiamondCut");
				//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
		});

		it ("Should add the Resale facet", async () => {
			const diamondCut = await ethers.getContractAt('IDiamondCut', marketDiamondInstance.address);
			const receiverFacetItem = {
				facetAddress: resaleFacetInstance.address,
				action: FacetCutAction_ADD,
				functionSelectors: getSelectors(resaleFacetInstance, usedSelectorsForMarketplace)
			}
			await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
				.to.emit(diamondCut, "DiamondCut");
				//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
		});

		it ("Should add the MultiSend tools", async () => {
			const diamondCut = await ethers.getContractAt('IDiamondCut', marketDiamondInstance.address);
			const receiverFacetItem = {
				facetAddress: multiSendFacetInstance.address,
				action: FacetCutAction_ADD,
				functionSelectors: getSelectors(multiSendFacetInstance, usedSelectorsForMarketplace)
			}
			await expect(await diamondCut.diamondCut([receiverFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
				.to.emit(diamondCut, "DiamondCut");
				//.withArgs([facetCutItem], ethers.constants.AddressZero, "");
		});
	});


	describe("Modifying facets", () => {
		it ("Shouldn't let other addresses modify the facets", async () => {
			const diamondCut = (await ethers.getContractAt('IDiamondCut', factoryDiamondInstance.address)).connect(addr1);
			const loupeFacetItem = {
				facetAddress: diamondLoupeFacetInstance.address,
				action: FacetCutAction_REPLACE,
				functionSelectors: getSelectors(diamondLoupeFacetInstance, usedSelectorsForFactory)
			}
			await expect(diamondCut.diamondCut([loupeFacetItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
				.to.be.revertedWith("LibDiamond: Must be contract owner");
		});
		//it ("Should replace facets");
		//it ("Should remove facets");
	});

	describe("AccessControl", () => {
		it ("Roles should be set up", async () => {
			await expect(
				await factoryDiamondInstance.hasRole(
					await factoryDiamondInstance.ADMINISTRATOR(), owner.address))
				.to.equal(true);
			await expect(
				await factoryDiamondInstance.hasRole(
					await factoryDiamondInstance.DEFAULT_ADMIN_ROLE(), owner.address))
				.to.equal(true);
			await expect(
				await factoryDiamondInstance.getRoleAdmin(
					await factoryDiamondInstance.ADMINISTRATOR()))
				.to.equal(await factoryDiamondInstance.ADMINISTRATOR());
		});
	});

	describe("Factory setup", () => {
		it ("Should properly add an ERC20 token to the Deployer Facet", async () => {
			const tokensFacet = await ethers.getContractAt('TokensFacet', factoryDiamondInstance.address);
			await expect(await tokensFacet.changeToken(erc20Instance.address, priceToDeploy))
				.to.emit(tokensFacet, 'ChangedToken')
				.withArgs(erc20Instance.address, priceToDeploy, owner.address);
		});

		it ("Should connect the Facet Source", async () => {
			const tokensFacet = await ethers.getContractAt('CreatorsFacet', factoryDiamondInstance.address);
			await expect(await tokensFacet.setFacetSource(facetSourceInstance.address))
				.to.not.be.reverted
			await expect(await tokensFacet.getFacetSource())
				.to.equal(facetSourceInstance.address)
		});
	})

	describe("Deployment of RAIR721 contracts", () => {
		it ("Should return the deployment cost of the current ERC20", async () => {
			const tokensFacet = await ethers.getContractAt('TokensFacet', factoryDiamondInstance.address);
			await expect(await tokensFacet.getDeploymentCost())
				.to.equal(priceToDeploy);
		})

		it ("Shouldn't deploy a RAIR contract without approving the tokens", async() => {
			const deployerFacet = await ethers.getContractAt('DeployerFacet', factoryDiamondInstance.address);
			await expect(deployerFacet.deployContract("TestRairOne!", "RAIR"))
				.to.be.revertedWith("Deployer: Not allowed to transfer tokens");
		});

		it ("Should approve the tokens needed to deploy", async() => {
			await expect(await erc20Instance.approve(factoryDiamondInstance.address, priceToDeploy * 2))
				.to.emit(erc20Instance, 'Approval')
				.withArgs(owner.address, factoryDiamondInstance.address, priceToDeploy * 2);
		});

		it ("Should deploy a RAIR contract after approving the tokens", async() => {
			const receiverFacet = await ethers.getContractAt('DeployerFacet', factoryDiamondInstance.address);
			const result = await receiverFacet.deployContract("TestRairOne!", "RAIR");
			// Get the deployed address, so if the block number is changed the test still pass
			firstDeploymentAddress = (await result.wait()).events.at(-1).args.at(2);
			await expect(result)
				.to.emit(receiverFacet, 'DeployedContract')
				.withArgs(owner.address, 0, firstDeploymentAddress, 'TestRairOne!')
				.to.emit(erc20Instance, "Transfer")
				.withArgs(owner.address, factoryDiamondInstance.address, priceToDeploy)
			await expect(await erc20Instance.balanceOf(owner.address))
				.to.equal(initialRAIR20Supply - priceToDeploy);
			await expect(await erc20Instance.balanceOf(factoryDiamondInstance.address))
				.to.equal(priceToDeploy);
		});

		it ("Should return excess tokens from the deployment", async() => {
			const receiverFacet = await ethers.getContractAt('DeployerFacet', factoryDiamondInstance.address);
			const result = await receiverFacet.deployContract('TestRairTwo!', 'HOT');
			// Get the deployed address, so if the block number is changed the test still pass
			secondDeploymentAddress = (await result.wait()).events.at(-1).args.at(2);
			await expect(result)
				.to.emit(receiverFacet, 'DeployedContract')
				.withArgs(owner.address, 1, secondDeploymentAddress, 'TestRairTwo!');
			await expect(await erc20Instance.balanceOf(owner.address))
				.to.equal(initialRAIR20Supply - (priceToDeploy * 2));
			await expect(await erc20Instance.balanceOf(factoryDiamondInstance.address))
				.to.equal(priceToDeploy * 2);
		});
	});

	describe("Creators Facet", () => {
		it ("Should return the correct amount of creators", async () => {
			const creatorFacet = await ethers.getContractAt('CreatorsFacet', factoryDiamondInstance.address);
			await expect(await creatorFacet.getCreatorsCount()).to.equal(1);
		});

		it ("Should return the address of the creators", async () => {
			const creatorFacet = await ethers.getContractAt('CreatorsFacet', factoryDiamondInstance.address);
			await expect(await creatorFacet.getCreatorAtIndex(0))
				.to.equal(owner.address);
		});

		it ("Should return the correct amount of contracts deployed by a creator", async () => {
			const creatorFacet = await ethers.getContractAt('CreatorsFacet', factoryDiamondInstance.address);
			await expect(await creatorFacet.getContractCountOf(owner.address)).to.equal(2);
		})

		it ("Should return the contracts deployed by a creator individually", async () => {
			const creatorFacet = await ethers.getContractAt('CreatorsFacet', factoryDiamondInstance.address);
			await expect(await creatorFacet.creatorToContractIndex(owner.address, 0))
				.to.equal(firstDeploymentAddress);
			await expect(await creatorFacet.creatorToContractIndex(owner.address, 1))
				.to.equal(secondDeploymentAddress);
		})
		
		it ("Should return the contracts deployed by a creator in a full list", async () => {
			const creatorFacet = await ethers.getContractAt('CreatorsFacet', factoryDiamondInstance.address);
			let contracts = await creatorFacet.creatorToContractList(owner.address);
			await expect(contracts[0]).to.equal(firstDeploymentAddress);
			await expect(contracts[1]).to.equal(secondDeploymentAddress);
		});

		it ("Should return the creator of a token deployed", async () => {
			const creatorFacet = await ethers.getContractAt('CreatorsFacet', factoryDiamondInstance.address);
			await expect(await creatorFacet.contractToCreator(firstDeploymentAddress))
				.to.equal(owner.address);
			await expect(await creatorFacet.contractToCreator(secondDeploymentAddress))
				.to.equal(owner.address);
		});
	});

	describe("Tokens Facet", () => {
		it ("Should display the balance of each approved token", async () => {
			let tokenFacet = await ethers.getContractAt('TokensFacet', factoryDiamondInstance.address);
			await expect(await erc20Instance.balanceOf(tokenFacet.address))
				.to.equal(priceToDeploy * 2); //2 deployments
		});

		it ("Shouldn't let the owners withdraw more than what the address holds", async () => {
			let tokenFacet = await ethers.getContractAt('TokensFacet', factoryDiamondInstance.address);
			await expect(tokenFacet.withdrawTokens(priceToDeploy * 2 + 1))
				.to.be.revertedWith("ERC20InsufficientBalance")
				.withArgs(
					factoryDiamondInstance.address,
					priceToDeploy * 2,
					301
				);
		});

		it ("Should let the owners withdraw tokens", async () => {
			let tokenFacet = await ethers.getContractAt('TokensFacet', factoryDiamondInstance.address);
			await expect(await tokenFacet.withdrawTokens(priceToDeploy * 2))
				.to.emit(erc20Instance, 'Transfer')
				/*.withArgs(
					tokenFacet.address,
					tokenFacet.address,
					owner.address,
					priceToDeploy * 2,
					'Factory Withdraw',
					''
				);*/
		});

		it ("Shouldn't let other addresses add erc20 tokens", async () => {
			const tokensFacet = (await ethers.getContractAt('TokensFacet', factoryDiamondInstance.address)).connect(addr1);
			await expect(tokensFacet.changeToken(extraERC20Instance.address, priceToDeploy))
				.to.be.revertedWith(`AccessControl: account ${addr1.address.toLowerCase()} is missing role ${await factoryDiamondInstance.ADMINISTRATOR()}`);
		});

		it ("Should remove erc20 tokens", async () => {
			const tokensFacet = await ethers.getContractAt('TokensFacet', factoryDiamondInstance.address);
			await expect(await tokensFacet.changeToken(extraERC20Instance.address, priceToDeploy))
				.to.emit(tokensFacet, 'ChangedToken')
				.withArgs(extraERC20Instance.address, priceToDeploy, owner.address);
		});

		it ("Should let owners grant their role to other addresses", async () => {
			await expect(await factoryDiamondInstance.grantRole(await factoryDiamondInstance.ADMINISTRATOR(), addr1.address))
				.to.emit(factoryDiamondInstance, 'RoleGranted')
				.withArgs(await factoryDiamondInstance.ADMINISTRATOR(), addr1.address, owner.address);
		});

		it ("Should let owners revoke their role to other addresses", async () => {
			await expect(await factoryDiamondInstance.revokeRole(await factoryDiamondInstance.ADMINISTRATOR(), addr1.address))
				.to.emit(factoryDiamondInstance, 'RoleRevoked')
				.withArgs(await factoryDiamondInstance.ADMINISTRATOR(), addr1.address, owner.address);
		});

		it ("Shouldn't let other owners renounce an address' role", async () => {
			await expect(factoryDiamondInstance.renounceRole(await factoryDiamondInstance.ADMINISTRATOR(), addr1.address))
				.to.be.revertedWith("AccessControl: can only renounce roles for self")
		});

		it ("Should let owners renounce their role", async () => {
			await expect(await factoryDiamondInstance.grantRole(await factoryDiamondInstance.ADMINISTRATOR(), addr1.address))
				.to.emit(factoryDiamondInstance, 'RoleGranted')
				.withArgs(await factoryDiamondInstance.ADMINISTRATOR(), addr1.address, owner.address);
			let factoryAsAddress1 = await factoryDiamondInstance.connect(addr1);
			await expect(await factoryAsAddress1.renounceRole(await factoryDiamondInstance.ADMINISTRATOR(), addr1.address))
				.to.emit(factoryDiamondInstance, 'RoleRevoked')
				.withArgs(await factoryDiamondInstance.ADMINISTRATOR(), addr1.address, addr1.address);
		});

		it ("Should return the number of owners in the factory", async () => {
			await expect(await factoryDiamondInstance.getRoleMemberCount(await factoryDiamondInstance.ADMINISTRATOR()))
				.to.equal(1);
		});

		it ("Should return the address of each owners in the factory", async () => {
			await expect(await factoryDiamondInstance.getRoleMember(await factoryDiamondInstance.ADMINISTRATOR(), 0))
				.to.equal(owner.address);
		});
	});

	describe("RAIR ERC721", () => {
		it ("Should have the RAIR symbol", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', firstDeploymentAddress);
			await expect(await erc721Facet.symbol())
				.to.equal("RAIR");
			erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(await erc721Facet.symbol())
				.to.equal("HOT");
		});

		it ("Should have the user defined name", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', firstDeploymentAddress);
			await expect(await erc721Facet.name())
				.to.equal("TestRairOne!");
			erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(await erc721Facet.name())
				.to.equal("TestRairTwo!");
		});

		it ("Should return the factory's address", async () => {
			let erc721Facet = await ethers.getContractAt('RAIR721_Diamond', firstDeploymentAddress);
			await expect(await erc721Facet.getFactoryAddress())
				.to.equal(factoryDiamondInstance.address);
			erc721Facet = await ethers.getContractAt('RAIR721_Diamond', secondDeploymentAddress);
			await expect(await erc721Facet.getFactoryAddress())
				.to.equal(factoryDiamondInstance.address);
		})
	});

	describe("RAIR Metadata Facet", () => {
		it ("Should return the contract's creator address", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', firstDeploymentAddress);
			await expect(await erc721Facet.getRoleMember(await erc721Facet.CREATOR(), 0))
				.to.equal(owner.address);
		});
	});

	describe("RAIR Product Facet", () => {
		it ("Should create a product", async () => {
			let productFacet = await ethers.getContractAt('RAIRProductFacet', firstDeploymentAddress);
			await expect(await productFacet.createProduct("FirstFirst", 1000))
				.to.emit(productFacet, 'CreatedCollection')
				.withArgs(0, "FirstFirst", 0, 1000);
			await expect(await productFacet.createProduct("FirstSecond", 50))
				.to.emit(productFacet, 'CreatedCollection')
				.withArgs(1, "FirstSecond", 1000, 50);

			productFacet = await ethers.getContractAt('RAIRProductFacet', secondDeploymentAddress);
			await expect(await productFacet.createProduct("SecondFirst", 100))
				.to.emit(productFacet, 'CreatedCollection')
				.withArgs(0, "SecondFirst", 0, 100);
			await expect(await productFacet.createProduct("SecondSecond", 900))
				.to.emit(productFacet, 'CreatedCollection')
				.withArgs(1, "SecondSecond", 100, 900);
		});

		it ('Should return full information about the products', async () => {
			let productFacet = await ethers.getContractAt('RAIRProductFacet', firstDeploymentAddress);

			let product1Data = await productFacet.getProductInfo(0);
			await expect(product1Data.startingToken).to.equal(0);
			await expect(product1Data.endingToken).to.equal(999);
			await expect(product1Data.mintableTokens).to.equal(1000);
			await expect(product1Data.name).to.equal('FirstFirst');

			let product2Data = await productFacet.getProductInfo(1);
			await expect(product2Data.startingToken).to.equal(1000);
			await expect(product2Data.endingToken).to.equal(1049);
			await expect(product2Data.mintableTokens).to.equal(50);
			await expect(product2Data.name).to.equal('FirstSecond');
		});

		it ("Should show information about the products", async () => {
			let productFacet = await ethers.getContractAt('RAIRProductFacet', firstDeploymentAddress);
			await expect(await productFacet.getProductCount())
				.to.equal(2);
			await expect(await productFacet.mintedTokensInProduct(0))
				.to.equal(0)

			productFacet = await ethers.getContractAt('RAIRProductFacet', secondDeploymentAddress);
			await expect(await productFacet.getProductCount())
				.to.equal(2);
			await expect(await productFacet.mintedTokensInProduct(0))
				.to.equal(0)
			await expect(await productFacet.mintedTokensInProduct(1))
				.to.equal(0)
		})
	});

	describe("RAIR Ranges Facet", () => {
		it ("Shouldn't create offers for invalid products", async () => {
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', firstDeploymentAddress);
			// createRange(uint productId, uint rangeStart, uint rangeEnd, uint price, uint tokensAllowed, uint lockedTokens, string calldata name)
			await expect(rangesFacet.createRange(2, 11, 1000, 950, 50, 'First First First'))
				.to.be.revertedWith('RAIR ERC721 Ranges: Collection does not exist');
		});

		it ("Shouldn't create ranges with invalid information", async () => {
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', firstDeploymentAddress);
			await expect(rangesFacet.createRange(0, 11, 1000, 950, 50, 'First First First'))
				.to.be.revertedWith("RAIR ERC721: Allowed tokens should be less than range's length");
			await expect(rangesFacet.createRange(0, 11, 1000, 9, 50, 'First First First'))
				.to.be.revertedWith("RAIR ERC721: Locked tokens should be less than range's length");
		});

		it ("Shouldn't create ranges worth less than 100wei", async () => {
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', firstDeploymentAddress);
			await expect(rangesFacet.createRange(0, 11, 1, 9, 5, 'First First First'))
				.to.be.revertedWith("RAIR ERC721: Minimum price allowed is 100 wei");
			await expect(rangesFacet.createRange(0, 11, 99, 9, 5, 'First First First'))
				.to.be.revertedWith("RAIR ERC721: Minimum price allowed is 100 wei");
		});

		it ("Should create ranges", async () => {
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', firstDeploymentAddress);
			// collectionId, rangeLength, price, tokensAllowed, lockedTokens, name
			await expect(await rangesFacet.createRange(0, 11, 100, 9, 5, 'First First First'))
				.to.emit(rangesFacet, 'CreatedRange')
				.withArgs(0, 0, 10, 100, 9, 5, 'First First First', 0)
				// productIndex, start, end, price, tokensAllowed, lockedTokens, name, rangeIndex
				.to.emit(rangesFacet, 'TradingLocked')
				.withArgs(0, 0, 10, 5);
				// Index, From, To, Tokens to Locked
			await expect(await rangesFacet.createRange(1, 26, 100000, 26, 0, 'First Second First'))
				.to.emit(rangesFacet, 'CreatedRange')
				.withArgs(1, 0, 25, 100000, 26, 0, 'First Second First', 1)
				.to.emit(rangesFacet, 'TradingUnlocked')
				.withArgs(1, 0, 25);
			await expect(await rangesFacet.createRange(1, 24, 200000, 24, 0, 'First Second Second'))
				.to.emit(rangesFacet, 'CreatedRange')
				.withArgs(1, 26, 49, 200000, 24, 0, 'First Second Second', 2)
				.to.emit(rangesFacet, 'TradingUnlocked')
				.withArgs(2, 26, 49);
		});

		it ("Should create ranges in batches", async () => {
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', secondDeploymentAddress);
			await expect(await rangesFacet.createRangeBatch(0, [
				{
					rangeLength: 11,
					price: 2000,
					tokensAllowed: 9,
					lockedTokens: 1,
					name: 'Second First First'
				}, {
					rangeLength: 89,
					price: 3500,
					tokensAllowed: 50,
					lockedTokens: 10,
					name: 'Second First Second'
				}
			]))
				.to.emit(rangesFacet, 'CreatedRange')
				.withArgs(0, 0, 10, 2000, 9, 1, 'Second First First', 0)
				.to.emit(rangesFacet, 'CreatedRange')
				.withArgs(0, 11, 99, 3500, 50, 10, 'Second First Second', 1)
				.to.emit(rangesFacet, 'TradingLocked')
				.withArgs(0, 0, 10, 1)
				.to.emit(rangesFacet, 'TradingLocked')
				.withArgs(1, 11, 99, 10);

			await expect(await rangesFacet.createRangeBatch(1, [
				{
					rangeLength: 101,
					price: 90000,
					tokensAllowed: 5,
					lockedTokens: 5,
					name: 'Second Second First'
				}, {
					rangeLength: 150,
					price: 35000,
					tokensAllowed: 50 ,
					lockedTokens: 10,
					name: 'Second Second Second'
				}
			]))
				.to.emit(rangesFacet, 'CreatedRange')
				.withArgs(1, 0, 100, 90000, 5, 5, 'Second Second First', 2)
				.to.emit(rangesFacet, 'CreatedRange')
				.withArgs(1, 101, 250, 35000, 50, 10, 'Second Second Second', 3)
				.to.emit(rangesFacet, 'TradingLocked')
				.withArgs(2, 0, 100, 5)
				.to.emit(rangesFacet, 'TradingLocked')
				.withArgs(3, 101, 250, 10);
		});

		it ("Should create FREE ranges", async () => {
			// collectionId, rangeLength, price, tokensAllowed, lockedTokens, name
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', secondDeploymentAddress);
			await expect(await rangesFacet.createRange(1, 250, 0, 1, 1, 'Second Second Third FREE'))
				.to.emit(rangesFacet, 'CreatedRange')
				.withArgs(1, 251, 500, 0, 1, 1, 'Second Second Third FREE', 4)
				.to.emit(rangesFacet, 'TradingLocked')
				.withArgs(4, 251, 500, 1);
		})

		it ("Should return the information about the offers", async () => {
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', firstDeploymentAddress);
			const infoZero = await rangesFacet.rangeInfo(0);
			const infoProductZero = await rangesFacet.productRangeInfo(0,0);
			await expect(infoZero['data'].rangeStart)
				.to.equal(infoProductZero.rangeStart)
				.to.equal(0);
			await expect(infoZero['data'].rangeEnd)
				.to.equal(infoProductZero.rangeEnd)
				.to.equal(10);
			await expect(infoZero['data'].tokensAllowed)
				.to.equal(infoProductZero.tokensAllowed)
				.to.equal(9);
			await expect(infoZero['data'].lockedTokens)
				.to.equal(infoProductZero.lockedTokens)
				.to.equal(5);
			await expect(infoZero['data'].rangePrice)
				.to.equal(infoProductZero.rangePrice)
				.to.equal(100);
			await expect(infoZero['data'].rangeName)
				.to.equal(infoProductZero.rangeName)
				.to.equal('First First First');
			await expect(infoZero['productIndex'])
				.to.equal(0);

			rangesFacet = await ethers.getContractAt('RAIRRangesFacet', secondDeploymentAddress);
			const secondInfoZero = await rangesFacet.rangeInfo(1);
			const secondInfoProductZero = await rangesFacet.productRangeInfo(0,1);
			await expect(secondInfoZero['data'].rangeStart)
				.to.equal(secondInfoProductZero.rangeStart)
				.to.equal(11);
			await expect(secondInfoZero['data'].rangeEnd)
				.to.equal(secondInfoProductZero.rangeEnd)
				.to.equal(99);
			await expect(secondInfoZero['data'].tokensAllowed)
				.to.equal(secondInfoProductZero.tokensAllowed)
				.to.equal(50);
			await expect(secondInfoZero['data'].lockedTokens)
				.to.equal(secondInfoProductZero.lockedTokens)
				.to.equal(10);
			await expect(secondInfoZero['data'].rangePrice)
				.to.equal(secondInfoProductZero.rangePrice)
				.to.equal(3500);
			await expect(secondInfoZero['data'].rangeName)
				.to.equal(secondInfoProductZero.rangeName)
				.to.equal('Second First Second');
			await expect(secondInfoZero['productIndex'])
				.to.equal(0);
		});

		it ("Shouldn't update offers with bad information", async () => {
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', secondDeploymentAddress);
			await expect(rangesFacet.updateRange(0, "ASDF", 4500, 45, 5))
				.to.be.revertedWith("RAIR ERC721: Allowed tokens should be less than the number of mintable tokens");
			await expect(rangesFacet.updateRange(0, "ASDF", 4500, 8, 13))
				.to.be.revertedWith("RAIR ERC721: Locked tokens should be less than the number of mintable tokens");
		});

		it ("Should update ranges", async () => {
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', secondDeploymentAddress);
			await expect(await rangesFacet.updateRange(0, "Second First First 2", 4500, 11, 11))
				.to.emit(rangesFacet, 'UpdatedRange')
				.withArgs(0, "Second First First 2", 4500, 11, 11);
			const {rangeStart, rangeEnd, tokensAllowed, lockedTokens, rangePrice, rangeName} = await rangesFacet.productRangeInfo(0,0);
			await expect(rangeStart).to.equal(0);
			await expect(rangeEnd).to.equal(10);
			await expect(tokensAllowed).to.equal(11);
			await expect(lockedTokens).to.equal(11);
			await expect(rangePrice).to.equal(4500);
			await expect(rangeName).to.equal('Second First First 2');
		});

		it ("Should show if a range can be created", async () => {
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', secondDeploymentAddress);
			await expect(await rangesFacet.canCreateRange(1, 2, 99))
				.to.equal(false);
			await expect(await rangesFacet.canCreateRange(1, 101, 249))
				.to.equal(false);
			await expect(await rangesFacet.canCreateRange(1, 50, 150))
				.to.equal(false);
			await expect(await rangesFacet.canCreateRange(1, 150, 350))
				.to.equal(false);
			await expect(await rangesFacet.canCreateRange(1, 251, 350))
				.to.equal(false);
			await expect(await rangesFacet.canCreateRange(1, 501, 600))
				.to.equal(true);
		});

		it ("Should point to the range's product", async () => {
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', secondDeploymentAddress);
			await expect(await rangesFacet.rangeToProduct(0)).to.equal(0);
			await expect(await rangesFacet.rangeToProduct(1)).to.equal(0);
			await expect(await rangesFacet.rangeToProduct(2)).to.equal(1);
			await expect(await rangesFacet.rangeToProduct(3)).to.equal(1);
		});
	});

	describe ("Creator side minting", () => {
		it ("Shouldn't let other addresses mint tokens", async () => {
			let erc721Facet = (await ethers.getContractAt('ERC721EnumerableFacet', firstDeploymentAddress)).connect(addr1);
			await expect(erc721Facet.mintFromRange(addr2.address, 0, 0))
				.to.be.revertedWith(`AccessControl: account ${addr1.address.toLowerCase()} is missing role ${await erc721Facet.MINTER()}`);
			erc721Facet = (await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress)).connect(addr2);
			await expect(erc721Facet.mintFromRange(addr1.address, 1, 3))
				.to.be.revertedWith(`AccessControl: account ${addr2.address.toLowerCase()} is missing role ${await erc721Facet.MINTER()}`);
		});

		it ("Shouldn't mint tokens outside of the range's boundaries", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(erc721Facet.mintFromRange(addr3.address, 1, 3))
				.to.be.revertedWith("RAIR ERC721: Invalid token index");
		});

		it ("Should let the creator mint tokens from ranges", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(await erc721Facet.mintFromRange(addr3.address, 2, 0))
				.to.emit(erc721Facet, 'Transfer')
				.withArgs(ethers.constants.AddressZero, addr3.address, 100);
		});

		it ("Shouldn't mint tokens from invalid ranges", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', firstDeploymentAddress);
			await expect(erc721Facet.mintFromRange(addr3.address, 3, 0))
				.to.be.revertedWith("RAIR ERC721: Range does not exist");
		});

		it ("Should return the owner of each token", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(await erc721Facet.ownerOf(100))
				.to.equal(addr3.address);
		});

		it ("Shouldn't return the owner of a non existant token", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(erc721Facet.ownerOf(101))
				.to.be.revertedWith("ERC721NonexistentToken")
				.withArgs(101);
		});

		it ("Should return the next mintable token of an offer", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(await erc721Facet.nextMintableTokenInRange(2))
				.to.equal(1);
		});

		it ("Should let a token's owner to approve other addresses to spend tokens", async () => {
			let erc721Facet = (await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress)).connect(addr3);
			await expect(await erc721Facet.approve(addr4.address, 100))
				.to.emit(erc721Facet, 'Approval')
				.withArgs(addr3.address, addr4.address, 100);
			await expect(await erc721Facet.getApproved(100))
				.to.equal(addr4.address);
		});

		it ("Should approve all tokens to third parties", async () => {
			let erc721Facet = (await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress)).connect(addr3);
			await expect(await erc721Facet.setApprovalForAll(addr1.address, true))
				.to.emit(erc721Facet, 'ApprovalForAll');
			await expect(await erc721Facet.isApprovedForAll(addr3.address, addr1.address))
				.to.equal(true);
		});

		it ("Should translate from standard token index to product index", async () => {
			let productFacet = await ethers.getContractAt('RAIRProductFacet', secondDeploymentAddress);
			await expect(await productFacet.tokenToProductIndex(100))
				.to.equal(0);
		});

		it ("Should translate from product token index to standard index", async () => {
			let productFacet = await ethers.getContractAt('RAIRProductFacet', secondDeploymentAddress);
			await expect(await productFacet.productToToken(1, 0))
				.to.equal(100);
		});

		it ("Should show the total number of tokens minted", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(await erc721Facet.totalSupply())
				.to.equal(1);
		})

		it ("Should show how many tokens an address holds", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(await erc721Facet.balanceOf(addr3.address))
				.to.equal(1);
		})

		it ("Should list the tokens owned by an address", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(await erc721Facet.tokenOfOwnerByIndex(addr3.address, 0))
				.to.equal(100);
		});

		it ("Should list the tokens minted", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(await erc721Facet.tokenByIndex(0))
				.to.equal(100);
		});

		it ("Should list the tokens minted in each product", async () => {
			let productFacet = await ethers.getContractAt('RAIRProductFacet', secondDeploymentAddress);
			await expect(await productFacet.tokenByProduct(1, 0))
				.to.equal(100);
		});

		it ("Shouldn't list the tokens minted in each product if the product doesn't exist", async () => {
			let productFacet = await ethers.getContractAt('RAIRProductFacet', secondDeploymentAddress);
			await expect(productFacet.tokenByProduct(2, 0))
				.to.be.revertedWith('RAIR ERC721: Collection does not exist');
		});

		it ("Should say if an address owns a token inside a product", async () => {
			let productFacet = await ethers.getContractAt('RAIRProductFacet', secondDeploymentAddress);
			await expect(await productFacet.ownsTokenInProduct(addr3.address, 0))
				.to.equal(false);
			await expect(await productFacet.ownsTokenInProduct(addr3.address, 1))
				.to.equal(true);
		});

		it ("Should say if an address owns a token inside a range", async () => {
			let productFacet = await ethers.getContractAt('RAIRProductFacet', secondDeploymentAddress);
			await expect(await productFacet.ownsTokenInRange(addr3.address, 0))
				.to.equal(false);
			await expect(await productFacet.ownsTokenInRange(addr3.address, 1))
				.to.equal(false);
			await expect(await productFacet.ownsTokenInRange(addr3.address, 2))
				.to.equal(true);
		});
	});

	describe ("Minting", () => {
		it ("Should let the creator mint tokens from ranges in batches", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(await erc721Facet.mintFromRangeBatch(
				[addr1.address, addr2.address, addr3.address],
				2,
				[1, 2, 3]
			))
			.to.emit(erc721Facet, 'Transfer')
			.withArgs(ethers.constants.AddressZero, addr1.address, 101)
			.to.emit(erc721Facet, 'Transfer')
			.withArgs(ethers.constants.AddressZero, addr2.address, 102)
			.to.emit(erc721Facet, 'Transfer')
			.withArgs(ethers.constants.AddressZero, addr3.address, 103);
		});

		it ("Should unlock the product for trading if all tokens are minted", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(await erc721Facet.mintFromRange(addr3.address, 2, 4))
				.to.emit(erc721Facet, 'Transfer')
				.withArgs(ethers.constants.AddressZero, addr3.address, 104)
				.to.emit(erc721Facet, 'TradingUnlocked')
				.withArgs(2, 0, 100);
		});

		it ("Should lock the range again if an update changes the number of locked tokens", async () => {
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', secondDeploymentAddress);
			// rangeId, price, tokens allowed, tokens locked
			await expect(await rangesFacet.updateRange(2, "Second Second First", 20000, 0, 5))
				.to.emit(rangesFacet, 'UpdatedRange')
				.withArgs(2, "Second Second First", 20000, 0, 5)
				.to.emit(rangesFacet, 'TradingLocked')
				.withArgs(2, 0, 100, 5);
		});

		it ("Shouldn't mint more tokens if the allowed number is 0", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(erc721Facet.mintFromRange(addr3.address, 2, 5))
				.to.be.revertedWith("RAIR ERC721: Not allowed to mint more tokens from this range!");
		})

		it ("Should emit an event if the entire range is minted", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', firstDeploymentAddress);
			const neededTokens = 26;
			await expect(await erc721Facet.mintFromRangeBatch(
				Array.from(Array(neededTokens).keys()).map(item => addr2.address),
				1,
				Array.from(Array(neededTokens).keys()).map((item, index) => index)
			))
				.to.emit(erc721Facet, 'RangeCompleted')
				// Range ID, Product ID
				.withArgs(1, 1);
		});

		it ("Shouldn't mint more tokens if the range is complete", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', firstDeploymentAddress);
			await expect(erc721Facet.mintFromRange(addr3.address, 1, 7))
				.to.be.revertedWith("RAIR ERC721: Cannot mint more tokens from this range!");
		})

		it ("Should emit an event if the entire product is minted", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', firstDeploymentAddress);
			const neededTokens = 24;
			await expect(await erc721Facet.mintFromRangeBatch(
				Array.from(Array(neededTokens).keys()).map(item => addr2.address),
				2,
				Array.from(Array(neededTokens).keys()).map((item, index) => 26 + index)
			))
				.to.emit(erc721Facet, 'RangeCompleted')
				.withArgs(2, 1)
				.to.emit(erc721Facet, 'ProductCompleted')
				.withArgs(1);
		});

		it ("Shouldn't mint more tokens if the range is complete", async () => {
			let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', firstDeploymentAddress);
			await expect(erc721Facet.mintFromRange(addr3.address, 1, 7))
				.to.be.revertedWith("RAIR ERC721: Cannot mint more tokens from this product!");
			await expect(erc721Facet.mintFromRange(addr3.address, 2, 27))
				.to.be.revertedWith("RAIR ERC721: Cannot mint more tokens from this product!");
		});
	});

	describe ("Token URI", () => {
		it ("Shouldn't let any non-creator address to modify the metadata", async () => {
			let metadataFacet = (await ethers.getContractAt('RAIRMetadataFacet', secondDeploymentAddress)).connect(addr2);
			await expect(metadataFacet.setContractURI("DEV.RAIR.TECH"))
				.to.be.revertedWith(`AccessControl: account ${addr2.address.toLowerCase()} is missing role ${await metadataFacet.CREATOR()}`);
			await expect(metadataFacet.setBaseURI("devs.rairs.techs/", true))
				.to.be.revertedWith(`AccessControl: account ${addr2.address.toLowerCase()} is missing role ${await metadataFacet.CREATOR()}`);
			await expect(metadataFacet.setCollectionURI(1, 'first.rair.tech', true))
				.to.be.revertedWith(`AccessControl: account ${addr2.address.toLowerCase()} is missing role ${await metadataFacet.CREATOR()}`);
			await expect(metadataFacet.setUniqueURI(100, 'hundreth.rair.tech/ASDF'))
				.to.be.revertedWith(`AccessControl: account ${addr2.address.toLowerCase()} is missing role ${await metadataFacet.CREATOR()}`);
		});

		it ("Shouldn't allow extensions without the '.'", async () => {
			let metadataFacet = await ethers.getContractAt('RAIRMetadataFacet', secondDeploymentAddress);
			await expect(metadataFacet.setMetadataExtension('json'))
				.to.be.revertedWith("RAIR ERC721: Extension must start with a '.'");
			await expect(await metadataFacet.setMetadataExtension('.webp'))
				.to.emit(metadataFacet, "UpdatedURIExtension")
				.withArgs('.webp');
		});

		it ("Should set the contract's URI", async () => {
			let metadataFacet = await ethers.getContractAt('RAIRMetadataFacet', secondDeploymentAddress);
			await expect(await metadataFacet.setContractURI("DEV.RAIR.TECH"))
				.to.emit(metadataFacet, 'UpdatedContractURI')
				.withArgs('DEV.RAIR.TECH');
			await expect(await metadataFacet.contractURI())
				.to.equal('DEV.RAIR.TECH');
		});

		it ("Should set the token's base URI", async () => {
			let metadataFacet = await ethers.getContractAt('RAIRMetadataFacet', secondDeploymentAddress);
			await expect(await metadataFacet.setBaseURI("devs.rairs.techs/", true))
				.to.emit(metadataFacet, 'UpdatedBaseURI')
				.withArgs('devs.rairs.techs/', true, ".webp");
			await expect(await metadataFacet.tokenURI(100))
				.to.equal("devs.rairs.techs/100.webp");
		});

		it ("Should set the token's product URI", async () => {
			let metadataFacet = await ethers.getContractAt('RAIRMetadataFacet', secondDeploymentAddress);
			await expect(await metadataFacet.setCollectionURI(1, 'first.rair.tech/', true))
				.to.emit(metadataFacet, 'UpdatedProductURI')
				.withArgs(1, 'first.rair.tech/', true, ".webp");
			await expect(await metadataFacet.tokenURI(100))
				.to.equal("first.rair.tech/0.webp");
		});

		it ("Should emit the OpenSea event to freeze the metadata", async () => {
			let metadataFacet = await ethers.getContractAt('RAIRMetadataFacet', secondDeploymentAddress);
			await expect(await metadataFacet.freezeMetadata(100))
				.to.emit(metadataFacet, 'PermanentURI');
		});

		it ("Should set the token's unique URI", async () => {
			let metadataFacet = await ethers.getContractAt('RAIRMetadataFacet', secondDeploymentAddress);
			await expect(await metadataFacet.setUniqueURI(100, 'hundreth.rair.tech/ASDF'))
				.to.emit(metadataFacet, 'UpdatedTokenURI')
				.withArgs(100, 'hundreth.rair.tech/ASDF');
			await expect(await metadataFacet.tokenURI(100))
				.to.equal("hundreth.rair.tech/ASDF");
		});

		it ("Should set the token's unique URI in batches", async () => {
			let metadataFacet = await ethers.getContractAt('RAIRMetadataFacet', secondDeploymentAddress);
			await expect(await metadataFacet.setUniqueURIBatch(
				[101, 102, 103],
				[
					'101.rair.tech/QWERTY',
					'102.rair.tech/QWERTY',
					'103.rair.tech/QWERTY'
				]
			))
				.to.emit(metadataFacet, 'UpdatedTokenURI')
				.withArgs(101, '101.rair.tech/QWERTY')
				.to.emit(metadataFacet, 'UpdatedTokenURI')
				.withArgs(102, '102.rair.tech/QWERTY')
				.to.emit(metadataFacet, 'UpdatedTokenURI')
				.withArgs(103, '103.rair.tech/QWERTY');
			await expect(await metadataFacet.tokenURI(101))
				.to.equal("101.rair.tech/QWERTY");
			await expect(await metadataFacet.tokenURI(102))
				.to.equal("102.rair.tech/QWERTY");
			await expect(await metadataFacet.tokenURI(103))
				.to.equal("103.rair.tech/QWERTY");
		});

		it ("Should delete the URIs", async () => {
			let metadataFacet = await ethers.getContractAt('RAIRMetadataFacet', secondDeploymentAddress);

			await expect(await metadataFacet.tokenURI(100))
				.to.equal("hundreth.rair.tech/ASDF");
			await expect(await metadataFacet.setUniqueURI(100, ''))
				.to.emit(metadataFacet, 'UpdatedTokenURI')
				.withArgs(100, '');

			await expect(await metadataFacet.tokenURI(100))
				.to.equal("first.rair.tech/0.webp");
			await expect(await metadataFacet.setCollectionURI(1, '', true))
				.to.emit(metadataFacet, 'UpdatedProductURI')
				.withArgs(1, '', true, ".webp");

			await expect(await metadataFacet.tokenURI(100))
				.to.equal("devs.rairs.techs/100.webp");
			await expect(await metadataFacet.setBaseURI("", false))
				.to.emit(metadataFacet, 'UpdatedBaseURI')
				.withArgs('', false, ".webp");

			await expect(await metadataFacet.tokenURI(100))
				.to.equal("");
		})

		it ("Should set the baseURI without the token index", async () => {
			let metadataFacet = await ethers.getContractAt('RAIRMetadataFacet', secondDeploymentAddress);
			await expect(await metadataFacet.setBaseURI("rair.cryptograyman.com/", false))
				.to.emit(metadataFacet, 'UpdatedBaseURI')
				.withArgs("rair.cryptograyman.com/", false, ".webp");

			await expect(await metadataFacet.tokenURI(100))
				.to.equal("rair.cryptograyman.com/");
		});

		it ("Should set the productURI without the token index", async () => {
			let metadataFacet = await ethers.getContractAt('RAIRMetadataFacet', secondDeploymentAddress);
			await expect(await metadataFacet.setCollectionURI(1, "rair.cryptograyman.com/product", false))
				.to.emit(metadataFacet, 'UpdatedProductURI')
				.withArgs(1, "rair.cryptograyman.com/product", false, ".webp");
				
			await expect(await metadataFacet.tokenURI(100))
				.to.equal("rair.cryptograyman.com/product");
		});
	});

	describe("NFT Trading", () => {
		it ("Should only let Traders trade tokens", async () => {
			let erc721Facet = (await ethers.getContractAt('ERC721EnumerableFacet', firstDeploymentAddress)).connect(addr2);
			await expect(erc721Facet['safeTransferFrom(address,address,uint256)'](addr2.address, addr3.address, 1004))
				.to.be.revertedWith(`AccessControl: account ${addr2.address.toLowerCase()} is missing role ${await erc721Facet.TRADER()}`);
			await expect(await erc721Facet.approve(owner.address, 1004)).to.not.be.reverted;
			erc721Facet = (await ethers.getContractAt('ERC721EnumerableFacet', firstDeploymentAddress));
			await expect(await erc721Facet['safeTransferFrom(address,address,uint256)'](addr2.address, addr3.address, 1004))
				.to.emit(erc721Facet, 'Transfer')
				.withArgs(addr2.address, addr3.address, 1004);
		});

		it ("Shouldn't trade tokens if the range is locked", async () => {
			let erc721Facet = (await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress)).connect(addr3);
			await expect(await erc721Facet.approve(owner.address, 100)).to.not.be.reverted;
			erc721Facet = (await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress));
			await expect(erc721Facet['safeTransferFrom(address,address,uint256)'](addr3.address, addr2.address, 100))
				.to.be.revertedWith("RAIR ERC721: Cannot transfer from a locked range!");
		});

		it ("Should say if a range is locked", async () => {
			let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', firstDeploymentAddress);
			await expect(await rangesFacet.isRangeLocked(0))
				.to.equal(true);
			await expect(await rangesFacet.isRangeLocked(1))
				.to.equal(false);
			await expect(await rangesFacet.isRangeLocked(2))
				.to.equal(false);
			rangesFacet = await ethers.getContractAt('RAIRRangesFacet', secondDeploymentAddress);
			await expect(await rangesFacet.isRangeLocked(0))
				.to.equal(true);
			await expect(await rangesFacet.isRangeLocked(1))
				.to.equal(true);
			await expect(await rangesFacet.isRangeLocked(2))
				.to.equal(true);
			await expect(await rangesFacet.isRangeLocked(3))
				.to.equal(true);
		});
	});

	describe("Minter Marketplace", () => {
		describe("Fee Setup", () => {
			it ("Should display decimal information", async () => {
				let feesFacet = await ethers.getContractAt('FeesFacet', marketDiamondInstance.address);
				await expect(await feesFacet.getDecimals())
					.to.equal(3);
			});

			it ("Should have no treasury address right after deployment", async () => {
				let feesFacet = await ethers.getContractAt('FeesFacet', marketDiamondInstance.address);
				await expect(await feesFacet.getTreasuryAddress())
					.to.equal(ethers.constants.AddressZero);
			});

			it ("Should update the treasury address", async () => {
				let feesFacet = await ethers.getContractAt('FeesFacet', marketDiamondInstance.address);
				await expect(await feesFacet.updateTreasuryAddress(treasuryAddress.address))
					.to.emit(feesFacet, 'UpdatedTreasuryAddress')
					.withArgs(treasuryAddress.address);
				await expect(await feesFacet.getTreasuryAddress())
					.to.equal(treasuryAddress.address);
			});

			it ("Should have the default 1% node fee", async () => {
				let feesFacet = await ethers.getContractAt('FeesFacet', marketDiamondInstance.address);
				let response = await feesFacet.getNodeFee()
				await expect(response.decimals)
					.to.equal(3);
				await expect(response.nodeFee)
					.to.equal(1000);
			});

			it ("Should have the default 9% treasury fee", async () => {
				let feesFacet = await ethers.getContractAt('FeesFacet', marketDiamondInstance.address);
				let response = await feesFacet.getTreasuryFee()
				await expect(response.decimals)
					.to.equal(3);
				await expect(response.treasuryFee)
					.to.equal(9000);
			});

			it ("Should update the treasury fee", async () => {
				let feesFacet = await ethers.getContractAt('FeesFacet', marketDiamondInstance.address);
				await expect(await feesFacet.updateTreasuryFee(5000))
					.to.emit(feesFacet, 'UpdatedTreasuryFee')
					.withArgs(3, 5000);
			});

			it ("Should update the treasury fee", async () => {
				let feesFacet = await ethers.getContractAt('FeesFacet', marketDiamondInstance.address);
				await expect(await feesFacet.updateNodeFee(5000))
					.to.emit(feesFacet, 'UpdatedNodeFee')
					.withArgs(3, 5000);
			});
		});
		
		describe("Validation for Minting Offers", () => {
			it ("Shouldn't add offers without the marketplace as a Minter", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.addMintingOffer(firstDeploymentAddress, 2, [
					{recipient: addr1.address, percentage: 30000},
					{recipient: addr2.address, percentage: 60000}
				], true, nodeAddress.address))
					.to.be.revertedWith("Minter Marketplace: This Marketplace isn't a Minter!");
			});

			it ("Should be granted the Minter role from the ERC721 Instance", async () => {
				let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', firstDeploymentAddress);
				await expect(await erc721Facet.grantRole(await erc721Facet.MINTER(), marketDiamondInstance.address))
					.to.emit(erc721Facet, 'RoleGranted')
					.withArgs(await erc721Facet.MINTER(), marketDiamondInstance.address, owner.address);
				erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
				await expect(await erc721Facet.grantRole(await erc721Facet.MINTER(), marketDiamondInstance.address))
					.to.emit(erc721Facet, 'RoleGranted')
					.withArgs(await erc721Facet.MINTER(), marketDiamondInstance.address, owner.address);
			});

			it ("Shouldn't add offers from other addresses", async () => {
				let mintingOffersFacet = (await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address)).connect(addr4);
				await expect(mintingOffersFacet.addMintingOffer(firstDeploymentAddress, 2, [
					{recipient: addr1.address, percentage: 30000},
					{recipient: addr2.address, percentage: 60000}
				], true, nodeAddress.address))
					.to.be.revertedWith("Minter Marketplace: Sender isn't the creator of the contract!");
			});

			it ("Shouldn't add an offer if the offer is complete", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.addMintingOffer(firstDeploymentAddress, 2, [
					{recipient: addr1.address, percentage: 29999},
					{recipient: addr2.address, percentage: 60000}
				], true, nodeAddress.address))
					.to.be.revertedWith("Minter Marketplace: Offer doesn't have tokens available!");
			});

			it ("Shouldn't add an offer if the percentages don't add up to a 100%", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.addMintingOffer(firstDeploymentAddress, 0, [
					{recipient: addr1.address, percentage: 29999},
					{recipient: addr2.address, percentage: 60000}
				], true, nodeAddress.address))
					.to.be.revertedWith("Minter Marketplace: Fees don't add up to 100%");
			});

			it ("Shouldn't add an offer if the fees don't divide properly", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.addMintingOffer(firstDeploymentAddress, 0, [
					{recipient: addr1.address, percentage: 2222},
					{recipient: addr2.address, percentage: 20000},
					{recipient: addr3.address, percentage: 20000},
					{recipient: addr4.address, percentage: 20000},
					{recipient: owner.address, percentage: 27778}
				], true, nodeAddress.address))
					.to.be.revertedWith("Minter Marketplace: Current fee configuration will result in missing funds");
			});

			it ("Shouldn't add an offer if the range doesn't exist", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.addMintingOffer(firstDeploymentAddress, 4, [
					{recipient: addr1.address, percentage: 30000},
					{recipient: addr2.address, percentage: 60000}
				], true, nodeAddress.address))
					.to.be.revertedWith("RAIR ERC721 Ranges: Range does not exist");
			});
		});

		describe("Creating offers", () => {
			it ("Shouldn't add an offer with splits so low that the resulting ETH is 0", async () => {
				receiveEthAttackerInstance = await ReceiveEthAttackerFactory.deploy();
				await receiveEthAttackerInstance.deployed();
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.addMintingOffer(secondDeploymentAddress, 0, [
					{recipient: addr1.address, percentage: 89999},
					{recipient: addr2.address, percentage: 1}
				]
				, true, nodeAddress.address))
					.to.be.revertedWith("Minter Marketplace: A percentage on the array will result in an empty transfer");
			});

			it ("Shouldn't add an offer if one of the custom splits points to a contract", async () => {
				receiveEthAttackerInstance = await ReceiveEthAttackerFactory.deploy();
				await receiveEthAttackerInstance.deployed();
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.addMintingOffer(secondDeploymentAddress, 0, [
					{recipient: addr1.address, percentage: 30000},
					{recipient: receiveEthAttackerInstance.address, percentage: 60000}
				], true, nodeAddress.address))
					.to.be.revertedWith("Minter Marketplace: Contracts can't be recipients of the splits");
			});

			it ("Should add an offer", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(await mintingOffersFacet.addMintingOffer(secondDeploymentAddress, 0, [
					{recipient: addr1.address, percentage: 30000},
					{recipient: addr2.address, percentage: 60000}
				], true, nodeAddress.address))
					.to.emit(mintingOffersFacet, "AddedMintingOffer")
					.withArgs(secondDeploymentAddress, 0, 'Second First First 2', 4500, 2, true, 0);
				/*
					event AddedMintingOffer(
						address erc721Address,
						uint rangeIndex,
						string rangeName,
						uint price,
						uint feeSplitsLength,
						uint offerIndex
					);
				*/
			});

			it ("Shouldn't add an offer for the same range and address", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.addMintingOffer(secondDeploymentAddress, 0, [
					{recipient: addr1.address, percentage: 30000},
					{recipient: addr2.address, percentage: 60000}
				], true, nodeAddress.address))
					.to.be.revertedWith("Minter Marketplace: Range already has an offer");
			});

			it ("Should add an offer for a range in the same contract", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(await mintingOffersFacet.addMintingOffer(secondDeploymentAddress, 1, [
					{recipient: addr1.address, percentage: 30000},
					{recipient: addr3.address, percentage: 30000},
					{recipient: addr2.address, percentage: 30000}
				], true, nodeAddress.address))
					.to.emit(mintingOffersFacet, "AddedMintingOffer")
					.withArgs(secondDeploymentAddress, 1, 'Second First Second', 3500, 3, true, 1);
			});

			it ("Should add an offer for a range on a different address", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(await mintingOffersFacet.addMintingOffer(firstDeploymentAddress, 0, [
					{recipient: addr2.address, percentage: 90000}
				], true, nodeAddress.address))
					.to.emit(mintingOffersFacet, "AddedMintingOffer")
					.withArgs(firstDeploymentAddress, 0, 'First First First', 100, 1, true, 2);
			});

			it ("Should return the number of offers each contract has", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(await mintingOffersFacet.getOffersCountForAddress(firstDeploymentAddress))
					.to.equal(1);
				await expect(await mintingOffersFacet.getOffersCountForAddress(secondDeploymentAddress))
					.to.equal(2);
			});

			it ("Should give information about each range by their offer index", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				let result = await mintingOffersFacet.getOfferInfo(0);
				await expect(result['mintOffer']['erc721Address']).to.equal(secondDeploymentAddress);
				await expect(result['mintOffer']['nodeAddress']).to.equal(nodeAddress.address);
				await expect(result['mintOffer']['rangeIndex']).to.equal(0);
				await expect(result['mintOffer']['fees'].length).to.equal(2);
				await expect(result['mintOffer']['fees'][0].percentage).to.equal(30000);
				await expect(result['mintOffer']['fees'][1].percentage).to.equal(60000);
				await expect(result['rangeData']['rangePrice']).to.equal(4500);
				await expect(result['productIndex']).to.equal(0);
			});

			it ("Should give information about each range by their offer index", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				let result = await mintingOffersFacet.getOfferInfoForAddress(secondDeploymentAddress, 0);
				await expect(result['offerIndex']).to.equal(0);
				await expect(result['mintOffer']['erc721Address']).to.equal(secondDeploymentAddress);
				await expect(result['mintOffer']['nodeAddress']).to.equal(nodeAddress.address);
				await expect(result['mintOffer']['rangeIndex']).to.equal(0);
				await expect(result['mintOffer']['fees'].length).to.equal(2);
				await expect(result['mintOffer']['fees'][0].percentage).to.equal(30000);
				await expect(result['mintOffer']['fees'][1].percentage).to.equal(60000);
				await expect(result['rangeData']['rangePrice']).to.equal(4500);
				await expect(result['productIndex']).to.equal(0);
			});

			it ("Shouldn't call the batch function without any offers", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.addMintingOfferBatch(
					secondDeploymentAddress,
					[],
					[],
					[],
					nodeAddress.address
				)).to.be.revertedWith("Minter Marketplace: No offers sent!");
			})

			it ("Should add offers in batches", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				let currentOffers = await mintingOffersFacet.getTotalOfferCount();
				await expect(currentOffers).to.equal(3);
				await expect(await mintingOffersFacet.addMintingOfferBatch(
					secondDeploymentAddress,
					[2, 3],
					[1,2].map(item => [
						{recipient: addr1.address, percentage: 10000},
						{recipient: addr3.address, percentage: 10000},
						{recipient: owner.address, percentage: 10000},
						{recipient: addr2.address, percentage: 60000}
					]),
					[false, false],
					nodeAddress.address
				))
					.to.emit(mintingOffersFacet, "AddedMintingOffer")
					.withArgs(secondDeploymentAddress, 2, 'Second Second First', 20000, 4, false, 3)
					.to.emit(mintingOffersFacet, "AddedMintingOffer")
					.withArgs(secondDeploymentAddress, 3, 'Second Second Second', 35000, 4, false, 4);
				await expect(await mintingOffersFacet.getTotalOfferCount()).to.equal(currentOffers.add(2));
			});

			it ("Should add an offer and not require splits if it's free", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(await mintingOffersFacet.addMintingOffer(
					secondDeploymentAddress,
					4,
					[],
					true,
					nodeAddress.address
				))
					.to.emit(mintingOffersFacet, "AddedMintingOffer")
					//erc721Address, rangeIndex, rangeName, price, feeSplitsLength, visible, offerIndex);
					.withArgs(secondDeploymentAddress, 4, 'Second Second Third FREE', 0, 0, true, 5);
			});
		});

		describe("Minting from the Marketplace", () => {
			it ("Shouldn't mint without permissions", async () => {
				// Remove Role
				let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
				await expect(await erc721Facet.revokeRole(await erc721Facet.MINTER(), marketDiamondInstance.address))
					.to.emit(erc721Facet, 'RoleRevoked')
					.withArgs(await erc721Facet.MINTER(), marketDiamondInstance.address, owner.address);

				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.buyMintingOffer(0, 0))
					.to.be.revertedWith("Minter Marketplace: This Marketplace isn't a Minter!");

				// Add Role again to keep testing
				await expect(await erc721Facet.grantRole(await erc721Facet.MINTER(), marketDiamondInstance.address))
					.to.emit(erc721Facet, 'RoleGranted')
					.withArgs(await erc721Facet.MINTER(), marketDiamondInstance.address, owner.address);
			});

			it ("Shouldn't mint if the offer isn't public", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.buyMintingOffer(3, 0, {value: 100000}))
					.to.be.revertedWith("Minter Marketplace: This offer is not ready to be sold!");
			});

			it ("Shouldn't mint if there isn't enough ETH sent", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.buyMintingOffer(0, 0, {value: 3749}))
					.to.be.revertedWith("Minter Marketplace: Insufficient funds!");
			});

			it ("Shouldn't mint tokens out of the range's boundaries", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.buyMintingOffer(0, 11, {value: 4500}))
					.to.be.revertedWith("RAIR ERC721: Invalid token index");
			});

			it ("Should mint tokens", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
				await expect(await mintingOffersFacet.buyMintingOffer(0, 0, {value: 4500}))
					//MintedToken(erc721Address, rangeIndex, tokenIndex, msg.sender);
					.to.emit(mintingOffersFacet, 'MintedToken')
					.withArgs(secondDeploymentAddress, 0, 0, owner.address)
					.to.emit(erc721Facet, 'Transfer')
					.withArgs(ethers.constants.AddressZero, owner.address, 0)
					.to.changeEtherBalances([
						owner,
						mintingOffersFacet,
						addr1,
						addr2,
						treasuryAddress,
						nodeAddress
					], [
						0 - (4500),
						0,
						(4500 / 100) * 30,
						(4500 / 100) * 60,
						(4500 / 100) * 5,
						(4500 / 100) * 5,
					]);
			});

			it ("Shouldn't batch mint with wrong information", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				let tokensList = [7, 8, 9, 10, 11];
				let addressList = [7, 8, 9, 10, 11].map(i => addr1.address);
				await expect(mintingOffersFacet.buyMintingOfferBatch(0, tokensList, addressList, {value: 4500 * tokensList.length}))
					.to.be.revertedWith("RAIR ERC721: Invalid token index");
				await expect(mintingOffersFacet.buyMintingOfferBatch(0, tokensList, addressList, {value: 4500 * tokensList.length - 1}))
					.to.be.revertedWith("Minter Marketplace: Insufficient funds!");
			});

			it ("Shouldn't call the batch mint function without any tokens", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.buyMintingOfferBatch(0, [], [owner.address]))
					.to.be.revertedWith("Minter Marketplace: No tokens sent!");
			});

			it ("Shouldn't call the batch mint function with arrays of different sizes", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.buyMintingOfferBatch(0, [7, 8, 9], [addr1.address]))
					.to.be.revertedWith("Minter Marketplace: Tokens and Addresses should have the same length");
			})

			it ("Should batch mint", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				let tokensList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
				let addressList = [
						owner.address,
						addr1.address,
						addr2.address,
						addr3.address,
						owner.address,
						addr1.address,
						addr2.address,
						addr3.address,
						owner.address,
						addr1.address,
					];
				await expect(await mintingOffersFacet.buyMintingOfferBatch(0, tokensList, addressList, {value: 4500 * tokensList.length}))
					.to.emit(mintingOffersFacet, 'MintedToken')
					.withArgs(secondDeploymentAddress, 0, 1, owner.address)
					.to.emit(mintingOffersFacet, 'MintedToken')
					.withArgs(secondDeploymentAddress, 0, 2, addr1.address)
					.to.emit(mintingOffersFacet, 'MintedToken')
					.withArgs(secondDeploymentAddress, 0, 3, addr2.address)
					.to.emit(mintingOffersFacet, 'MintedToken')
					.withArgs(secondDeploymentAddress, 0, 4, addr3.address)
					.to.emit(mintingOffersFacet, 'MintedToken')
					.withArgs(secondDeploymentAddress, 0, 5, owner.address)
					.to.emit(mintingOffersFacet, 'MintedToken')
					.withArgs(secondDeploymentAddress, 0, 6, addr1.address)
					.to.emit(mintingOffersFacet, 'MintedToken')
					.withArgs(secondDeploymentAddress, 0, 7, addr2.address)
					.to.emit(mintingOffersFacet, 'MintedToken')
					.withArgs(secondDeploymentAddress, 0, 8, addr3.address)
					.to.emit(mintingOffersFacet, 'MintedToken')
					.withArgs(secondDeploymentAddress, 0, 9, owner.address)
					.to.emit(mintingOffersFacet, 'MintedToken')
					.withArgs(secondDeploymentAddress, 0, 10, addr1.address)
					.to.changeEtherBalances([
						owner,
						mintingOffersFacet,
						addr1,
						addr2,
						nodeAddress,
						treasuryAddress
					], [
						0 - (4500 * tokensList.length),
						0,
						((4500 * tokensList.length) / 100) * 30,
						((4500 * tokensList.length) / 100) * 60,
						((4500 * tokensList.length) / 100) * 5,
						((4500 * tokensList.length) / 100) * 5,
					]);

					/*
					console.log(await mintingOffersFacet.getOfferInfo(1));
					mintOffer: [
					  '0x9472EF1614f103Ae8f714cCeeF4B438D353Ce1Fa',
					  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
					  BigNumber { value: "1" },
					  [ [Array], [Array], [Array] ],
					  true,
					  erc721Address: '0x9472EF1614f103Ae8f714cCeeF4B438D353Ce1Fa',
					  nodeAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
					  rangeIndex: BigNumber { value: "1" },
					  fees: [ [Array], [Array], [Array] ],
					  visible: true
					],
					rangeData: [
					  BigNumber { value: "11" },
					  BigNumber { value: "99" },
					  BigNumber { value: "50" },
					  BigNumber { value: "89" },
					  BigNumber { value: "10" },
					  BigNumber { value: "3500" },
					  'Second First Second',
					  rangeStart: BigNumber { value: "11" },
					  rangeEnd: BigNumber { value: "99" },
					  tokensAllowed: BigNumber { value: "50" },
					  mintableTokens: BigNumber { value: "89" },
					  lockedTokens: BigNumber { value: "10" },
					  rangePrice: BigNumber { value: "3500" },
					  rangeName: 'Second First Second'
					],
					productIndex: BigNumber { value: "0" }*/
			});

			it ("Shouldn't mint more tokens if the range is complete", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(mintingOffersFacet.buyMintingOffer(0, 0, {value: 4500}))
					.to.be.revertedWith("RAIR ERC721: Cannot mint more tokens from this range!")
			});

			it ("Should update marketplace offers", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				await expect(await mintingOffersFacet.updateMintingOffer(1, [
					{recipient: addr1.address, percentage: 45000},
					{recipient: addr2.address, percentage: 45000}
				], false)).to.emit(mintingOffersFacet, "UpdatedMintingOffer").withArgs(secondDeploymentAddress, 1, 2, false, 1);
			});

			it ("Should mint FREE tokens", async () => {
				let mintingOffersFacet = await ethers.getContractAt('MintingOffersFacet', marketDiamondInstance.address);
				let erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
				await expect(await mintingOffersFacet.buyMintingOffer(5, 251, {value: 0}))
					//MintedToken(erc721Address, rangeIndex, tokenIndex, msg.sender);
					.to.emit(mintingOffersFacet, 'MintedToken')
					.withArgs(secondDeploymentAddress, 5, 501, owner.address)
					.to.emit(erc721Facet, 'Transfer')
					.withArgs(ethers.constants.AddressZero, owner.address, 501)
					.to.changeEtherBalances([
						owner,
						mintingOffersFacet,
						addr1,
						addr2,
						addr4
					], [
						0,
						0,
						0,
						0,
						0
					]);
			});
		});

		describe("ERC721 Security", () => {
			it ("Shouldn't run the DiamondCut function", async () => {
				let diamondCut = await ethers.getContractAt('IDiamondCut', firstDeploymentAddress);
				const ownershipCutItem = {
					facetAddress: ownershipFacetInstance.address,
					action: FacetCutAction_REMOVE,
					functionSelectors: getSelectors(ownershipFacetInstance, usedSelectorsForFactory)
				}
				await expect(diamondCut.diamondCut([ownershipCutItem], ethers.constants.AddressZero, ethers.utils.toUtf8Bytes('')))
					.to.be.revertedWith("LibDiamond: Must be contract owner");
			});

			it ("Shouldn't be able to modify roles of the Master Factory", async () => {
				let diamondFacet = await ethers.getContractAt('FactoryDiamond', firstDeploymentAddress);
				await expect(diamondFacet.grantRole(await factoryDiamondInstance.ADMINISTRATOR(), addr1.address))
					.to.be.revertedWith(`AccessControl: account ${owner.address.toLowerCase()} is missing role ${await factoryDiamondInstance.DEFAULT_ADMIN_ROLE()}`);
			});

			/*it ("Shouldn't grant ERC20 roles from the Master Factory", async () => {
				let tokenReceiverFacet = await ethers.getContractAt('TokensFacet', firstDeploymentAddress);
				await expect(await tokenReceiverFacet.changeToken(addr1.address, priceToDeploy * 2))
					.to.be.revertedWith('ASDASDASD');
			});

			it ("Shouldn't withdraw tokens from the Master Factory", async () => {
				let tokenReceiverFacet = await ethers.getContractAt('TokensFacet', firstDeploymentAddress);
				await expect(tokenReceiverFacet.withdrawTokens(1)).to.be.reverted;
			});*/
		});

		describe("Factory Security", () => {
			it ("Shouldn't create products", async () => {
				let productFacet = await ethers.getContractAt('RAIRProductFacet', factoryDiamondInstance.address);
				await expect(productFacet.createProduct("FirstFirst", 1000)).to.be.reverted;
			});

			it ("Shouldn't create ranges", async () => {
				let rangesFacet = await ethers.getContractAt('RAIRRangesFacet', factoryDiamondInstance.address);
				await expect(rangesFacet.createRange(0, 0, 10, 1000, 9, 5, 'First First First')).to.be.reverted;
			});

			it ("Shouldn't call view functions", async () => {
				let productFacet = await ethers.getContractAt('RAIRProductFacet', factoryDiamondInstance.address);
				await expect(productFacet.hasTokenInProduct(owner.address, 0, 0, 100)).to.be.reverted;
				await expect(productFacet.ownsTokenInProduct(owner.address, 0)).to.be.reverted;
				await expect(productFacet.ownsTokenInRange(owner.address, 0)).to.be.reverted;
				await expect(productFacet.productToToken(0, 0)).to.be.reverted;
				await expect(productFacet.tokenByProduct(0, 0)).to.be.reverted;
				await expect(productFacet.tokenOfOwnerByIndex(owner.address, 0)).to.be.reverted;
				await expect(productFacet.tokenToProduct(0)).to.be.reverted;
				await expect(productFacet.tokenToProductIndex(0)).to.be.reverted;
			});
		});
	});

	describe("Points system", () => {
		it("Should have roles set up", async () => {
			await expect(await factoryDiamondInstance.hasRole(await factoryDiamondInstance.ADMINISTRATOR(), owner.address))
				.to.equal(true);
		});

		it("Shouldn't take tokens without approval", async () => {
			const pointsInstanceWithDeposit = await ethers.getContractAt('PointsDeposit', factoryDiamondInstance.address);
			await expect(pointsInstanceWithDeposit.depositTokens(2000))
				.to.be.revertedWith('PointsDeposit: Not allowed to transfer tokens');
		});

		it ("Should approve the tokens needed to deploy", async() => {
			await expect(await extraERC20Instance.approve(factoryDiamondInstance.address, 2500))
				.to.emit(extraERC20Instance, 'Approval')
				.withArgs(owner.address, factoryDiamondInstance.address, 2500);
			await expect(await extraERC20Instance.transfer(addr1.address, 2500)).to.not.be.reverted;
			await expect(await (await extraERC20Instance.connect(addr1)).approve(factoryDiamondInstance.address, 2500))
				.to.emit(extraERC20Instance, 'Approval')
				.withArgs(addr1.address, factoryDiamondInstance.address, 2500);
		});

		it("Should take tokens after approval", async () => {
			const pointsInstanceWithDeposit = await ethers.getContractAt('PointsDeposit', factoryDiamondInstance.address);
			await expect(await pointsInstanceWithDeposit.depositTokens(200))
				.to.emit(pointsInstanceWithDeposit, "ReceivedTokens")
				.withArgs(owner.address, extraERC20Instance.address, 200, 200);
			await expect(
				await (await pointsInstanceWithDeposit.connect(addr1)).depositTokens(2000))
				.to.emit(pointsInstanceWithDeposit, "ReceivedTokens")
				.withArgs(addr1.address, extraERC20Instance.address, 2000, 2000);
		});
		
		it("Should display token balances", async () => {
			const pointsInstanceWithQuery = await ethers.getContractAt('PointsQuery', factoryDiamondInstance.address);
			await expect(await pointsInstanceWithQuery.getUserPoints(owner.address))
				.to.equal(200);
			await expect(await pointsInstanceWithQuery.getUserPoints(addr1.address))
				.to.equal(2000);
		});
			
		it("Should display overall balances", async () => {
			const pointsInstanceWithQuery = await ethers.getContractAt('PointsQuery', factoryDiamondInstance.address);
			await expect(await pointsInstanceWithQuery.getTotalUserPoints(owner.address))
				.to.equal(500);  // 300 from the past 2 deployments and 200 from the deposit above
			await expect(await pointsInstanceWithQuery.getTotalUserPoints(addr1.address))
				.to.equal(2000);
			await expect(await pointsInstanceWithQuery.getTotalUserPoints(addr2.address))
				.to.equal(0);
		});

		it ("Should setup the time limit", async () => {
			const pointsInstanceWithWithdraw = await ethers.getContractAt('PointsWithdraw', factoryDiamondInstance.address);
			// A bit over 3 minutes limit before hash expires
			await pointsInstanceWithWithdraw.setWithdrawTimeLimit(300);
		});

		it ("Shouldn't generate a signed message if amount is greater than balance", async () => {
			const pointsInstanceWithWithdraw = await ethers.getContractAt('PointsWithdraw', factoryDiamondInstance.address);
			const withdrawValue = [
				extraERC20Instance.address, // Token address 
				10000,				   // Amount
			];
			await expect(pointsInstanceWithWithdraw.getWithdrawHash(
				addr1.address,
				...withdrawValue
			)).to.be.revertedWith("PointsWithdraw: Invalid withdraw amount");
		});

		it ("Should withdraw with signed messages", async () => {
			const pointsInstanceWithWithdraw = await ethers.getContractAt('PointsWithdraw', factoryDiamondInstance.address);
			const withdrawValue = [
				extraERC20Instance.address, 	// ERC20
				1000,							// Amount
			];
			const withdrawMessage = await pointsInstanceWithWithdraw.getWithdrawHash(
				addr1.address,
				...withdrawValue
			);

			// One minute later
			await time.increase(60);

			const signedMessageOwner = await owner.signMessage(ethers.utils.arrayify(withdrawMessage));
			await expect(
				await (await pointsInstanceWithWithdraw.connect(addr1))
					.withdraw(1000, signedMessageOwner)
			)
				.to.emit(extraERC20Instance, "Transfer")
				.to.emit(pointsInstanceWithWithdraw, "WithdrewPoints")
				.withArgs(addr1.address, extraERC20Instance.address, 1000);
			const pointsInstanceWithQuery = await ethers.getContractAt('PointsQuery', factoryDiamondInstance.address);
			await expect(await pointsInstanceWithQuery.getUserPoints(addr1.address))
				.to.equal(1000);
			await expect(await extraERC20Instance.balanceOf(addr1.address)).to.equal(1500);
		});

		it ("Shouldn't withdraw with signed message twice", async () => {
			const pointsInstanceWithWithdraw = await ethers.getContractAt('PointsWithdraw', factoryDiamondInstance.address);
			const withdrawValue = [
				extraERC20Instance.address, // ERC20 
				10,					   // Amount
			];
			const withdrawMessage = await pointsInstanceWithWithdraw.getWithdrawHash(
				addr1.address,
				...withdrawValue
			);
			const signedMessageOwner = await owner.signMessage(ethers.utils.arrayify(withdrawMessage));
			await expect(
				await (await pointsInstanceWithWithdraw.connect(addr1))
					.withdraw(10, signedMessageOwner)
			)
				.to.emit(extraERC20Instance, "Transfer")
				.to.emit(pointsInstanceWithWithdraw, "WithdrewPoints")
				.withArgs(addr1.address, extraERC20Instance.address, 10);
			const pointsInstanceWithQuery = await ethers.getContractAt('PointsQuery', factoryDiamondInstance.address);
			await expect(await pointsInstanceWithQuery.getUserPoints(addr1.address))
				.to.equal(990);
			await expect(await extraERC20Instance.balanceOf(addr1.address)).to.equal(1510);
			await expect(
				pointsInstanceWithWithdraw.connect(addr1)
					.withdraw(10, signedMessageOwner)
			).to.be.revertedWith("PointsWithdraw: Invalid withdraw request");
		});

		it ("Shouldn't withdraw with signed messages if it took too long", async () => {
			const pointsInstanceWithWithdraw = await ethers.getContractAt('PointsWithdraw', factoryDiamondInstance.address);
			const withdrawValue = [
				extraERC20Instance.address, // ERC20
				900,						// Amount
			];
			const withdrawMessage = await pointsInstanceWithWithdraw.getWithdrawHash(
				addr1.address,
				...withdrawValue
			);
			// 4 mins
			await time.increase(250);
			const signedMessageOwner = await owner.signMessage(ethers.utils.arrayify(withdrawMessage));
			await expect(
				pointsInstanceWithWithdraw.connect(addr1).withdraw(900, signedMessageOwner)
			).to.be.revertedWith("PointsWithdraw: Invalid withdraw request");
		});

		it ("Shouldn't withdraw without signed messages", async () => {
			const pointsInstanceWithWithdraw = await ethers.getContractAt('PointsWithdraw', factoryDiamondInstance.address);
			const withdrawValue = [
				erc20Instance.address,
				600,
			];
			const withdrawMessage = await pointsInstanceWithWithdraw.getWithdrawHash(
				addr1.address,
				...withdrawValue
			);
			const signedMessageAddr1 = await addr1.signMessage(ethers.utils.arrayify(withdrawMessage));
			await expect(
				(pointsInstanceWithWithdraw.connect(addr1))
					.withdraw(600, signedMessageAddr1)
			).to.be.revertedWith("PointsWithdraw: Invalid withdraw request");
		});

		it ("Should withdraw all points", async () => {
			const pointsInstanceWithQuery = await ethers.getContractAt('PointsQuery', factoryDiamondInstance.address);
			const pointsInstanceWithWithdraw = await ethers.getContractAt('PointsWithdraw', factoryDiamondInstance.address);
			const currentUserBalance = await pointsInstanceWithQuery.getUserPoints(addr1.address);
			const withdrawValue = [
				extraERC20Instance.address, 	// ERC20 
				currentUserBalance,				// Amount
			];
			const withdrawMessage = await pointsInstanceWithWithdraw.getWithdrawHash(
				addr1.address,
				...withdrawValue
			);
			await time.increase(50);
			const signedMessageOwner = await owner.signMessage(ethers.utils.arrayify(withdrawMessage));
			await expect(
				await (await pointsInstanceWithWithdraw.connect(addr1))
					.withdraw(currentUserBalance, signedMessageOwner)
			)
				.to.emit(extraERC20Instance, "Transfer")
				.to.emit(pointsInstanceWithWithdraw, "WithdrewPoints")
				.withArgs(addr1.address, extraERC20Instance.address, currentUserBalance);
			await expect(await pointsInstanceWithQuery.getUserPoints(addr1.address))
				.to.equal(0);
			await expect(await extraERC20Instance.balanceOf(addr1.address)).to.equal(2500);
		});
	});

	describe("Resale Facet", () => {
		it ("Shouldn't set up resale configs without the role", async () => {
			const resaleFacet = await (
				await ethers.getContractAt(
					'ResaleFacet',
					marketDiamondInstance.address
				)
			).connect(addr4);
			await expect(resaleFacet.setPurchaseGracePeriod(1)).to.be.revertedWith(`AccessControl: account ${addr4.address.toLowerCase()} is missing role ${await resaleFacet.MAINTAINER()}`);
			await expect(resaleFacet.setDecimalPow(2)).to.be.revertedWith(`AccessControl: account ${addr4.address.toLowerCase()} is missing role ${await resaleFacet.MAINTAINER()}`);
		});

		it ("Shouldn't generate a hash if the marketplace isn't approved", async () => {
			const resaleInstance = await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address);
			await expect(resaleInstance.generateResaleHash(
				secondDeploymentAddress,	// erc721,
				addr3.address,				// buyer,
				owner.address,				// seller,
				0, 							// token,
				200000,						// tokenPrice
				addr4.address				// Node address
			)).to.be.revertedWith("Resale: Marketplace isn't approved for transfers");
		});

		it ("Should grant all necessary roles", async () => {
			const resaleFacet = await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address);
			const erc721Facet = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(
				await resaleFacet.grantRole(
					await resaleFacet.MAINTAINER(),
					addr4.address
				)
			)
				.to.emit(resaleFacet, "RoleGranted")
				.withArgs(await resaleFacet.MAINTAINER(), addr4.address, owner.address);
			await expect(
				await resaleFacet.grantRole(
					await resaleFacet.RESALE_ADMIN(),
					owner.address
				)
			)
				.to.emit(resaleFacet, "RoleGranted")
				.withArgs(await resaleFacet.RESALE_ADMIN(), owner.address, owner.address);

			await expect(
				await erc721Facet.grantRole(
					await erc721Facet.TRADER(),
					resaleFacet.address
				)
			)
				.to.emit(erc721Facet, "RoleGranted")
				.withArgs(await erc721Facet.TRADER(), resaleFacet.address, owner.address);
		});

		it ("Should set up the resale marketplace data", async () => {
			const resaleFacet = await (
				await ethers.getContractAt(
					'ResaleFacet',
					marketDiamondInstance.address
				)
			).connect(addr4);
			await expect(await resaleFacet.setPurchaseGracePeriod(120)).not.to.be.reverted;
			await expect(await resaleFacet.setDecimalPow(3)).not.to.be.reverted;
		});

		it ("Should generate a hash if the marketplace is approved", async () => {
			const resaleInstance = await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address);
			const erc721Instance = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(
				await erc721Instance.setApprovalForAll(resaleInstance.address, true)
			)
				.to.emit(erc721Instance, "ApprovalForAll")
				.withArgs(owner.address, resaleInstance.address, true);

			const args = [
				secondDeploymentAddress,	// erc721,
				addr3.address,				// buyer,
				owner.address,				// seller,
				0, 							// token,
				200000,						// tokenPrice
				addr4.address				// Node address
			]

			await expect(resaleInstance.generateResaleHash(...args)).not.to.be.reverted;
		});

		it ("Should purchase a token with the generated signature", async () => {
			const resaleInstance = await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address);
			const resaleInstanceAddr3 = await (
				await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address)
			).connect(addr3);

			const args = [
				secondDeploymentAddress,	// erc721,
				addr3.address,				// buyer,
				owner.address,				// seller,
				0, 							// token,
				200000,						// tokenPrice
			]

			const hash = await resaleInstance.generateResaleHash(...[...args, nodeAddress.address]);

			const signedMessageOwner = await owner.signMessage(ethers.utils.arrayify(hash));
			const erc721Instance = await ethers.getContractAt('ERC721EnumerableFacet', secondDeploymentAddress);
			await expect(
				await resaleInstanceAddr3.purchaseTokenOffer(...[...args, nodeAddress.address], signedMessageOwner, {value: 200000})
			)
				.to.emit(resaleInstance, 'TokenSold')
				.withArgs(...args)
				.changeEtherBalances([
					addr3,
					nodeAddress,
					treasuryAddress,
					owner
				], [
					-200000,
					10000,
					10000,
					180000,
				])
		});

		it ("Shouldn't purchase a token twice", async () => {
			const resaleInstance = await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address);
			
			// Address 3 approves the marketplace
			const erc721Instance = (
				await ethers.getContractAt(
					'ERC721EnumerableFacet',
					secondDeploymentAddress
				)
			).connect(addr3);
			await expect(
				await erc721Instance.setApprovalForAll(resaleInstance.address, true)
			)
				.to.emit(erc721Instance, "ApprovalForAll")
				.withArgs(addr3.address, resaleInstance.address, true);

			// Generate the hash for the sale
			const resaleInstanceAddr3 = await (
				await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address)
			).connect(addr3);

			const args = [
				secondDeploymentAddress,	// erc721,
				owner.address,				// buyer,
				addr3.address,				// seller,
				0, 							// token,
				200000,						// tokenPrice
			]

			const hash = await resaleInstance.generateResaleHash(...[...args, nodeAddress.address]);

			const signedMessageOwner = await owner.signMessage(ethers.utils.arrayify(hash));
			await expect(
				await resaleInstanceAddr3.purchaseTokenOffer(
					...args,
					nodeAddress.address,
					signedMessageOwner,
					{value: 200000}
				)
			)
				.to.emit(resaleInstance, 'TokenSold')
				.withArgs(...args);

			// Try to run the same purchase again
			await expect(
				resaleInstanceAddr3.purchaseTokenOffer(
					...[...args, nodeAddress.address],
					signedMessageOwner,
					{value: 200000}
				)
			)
				.to.be.revertedWith("ERC721IncorrectOwner")
				.withArgs(
					addr3.address,
					0,
					owner.address
				);
		});

		it ("Shouldn't purchase with wrong information", async () => {
			const resaleInstance = await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address);
			const resaleInstanceAddr3 = await (
				await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address)
			).connect(addr3);

			const args = [
				secondDeploymentAddress,	// erc721,
				owner.address,				// buyer,
				addr3.address,				// seller,
				0, 							// token,
				200000,						// tokenPrice
			]

			const hash = await resaleInstance.generateResaleHash(...[...args, addr4.address]);

			const signedMessageOwner = await owner.signMessage(ethers.utils.arrayify(hash));
			await expect(
				resaleInstanceAddr3.purchaseTokenOffer(
					secondDeploymentAddress,	// erc721,
					owner.address,				// buyer,
					addr2.address,				// seller,
					0, 							// token,
					2000,
					nodeAddress.address,
					signedMessageOwner,
					{value: 2000}
				)
			)
				.to.be.revertedWith("Resale: Marketplace isn't approved for transfers");
			
				// Address 2 happens to have approved the marketplace
			const erc721Instance = (
				await ethers.getContractAt(
					'ERC721EnumerableFacet',
					secondDeploymentAddress
				)
			).connect(addr2);
			// Try again
			await expect(
				await erc721Instance.setApprovalForAll(resaleInstance.address, true)
			)
				.to.emit(erc721Instance, "ApprovalForAll")
				.withArgs(addr2.address, resaleInstance.address, true);

				await expect(
					resaleInstanceAddr3.purchaseTokenOffer(
						secondDeploymentAddress,	// erc721,
						owner.address,				// buyer,
						addr2.address,				// seller,
						0, 							// token,
						2000,
						nodeAddress.address,
						signedMessageOwner,
						{value: 2000}
					)
				)
					.to.be.revertedWith("Resale: Invalid withdraw request");
		});

		it ("Shouldn't purchase after 2 minutes", async () => {
			const resaleInstance = await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address);
			const resaleInstanceAddr3 = await (
				await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address)
			).connect(addr3);

			const args = [
				secondDeploymentAddress,	// erc721,
				addr3.address,				// buyer,
				owner.address,				// seller,
				0, 							// token,
				200000,						// tokenPrice
				addr4.address				// Node address
			]

			const hash = await resaleInstance.generateResaleHash(...args);

			const signedMessageOwner = await owner.signMessage(ethers.utils.arrayify(hash));

			await time.increase(120);

			await expect(
				resaleInstanceAddr3.purchaseTokenOffer(...args, signedMessageOwner, {value: 200000})
			)
				.to.be.revertedWith("Resale: Invalid withdraw request")
		});

		it ("Shouldn't set custom royalties if it's not owner", async () => {
			const resaleInstance = 
				(await ethers.getContractAt(
					'ResaleFacet',
					marketDiamondInstance.address
				)).connect(addr1);
			await expect(resaleInstance.setRoyalties(secondDeploymentAddress, [
				{
					recipient: addr4.address,
					percentage: 4000
				}, {
					recipient: addr1.address,
					percentage: 26000
				}, 
			])).to.be.revertedWith('Resale: Only the owner of a contract can set custom royalties');
		});

		it ("Should set custom royalties", async () => {
			const resaleInstance = await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address);
			await expect(await resaleInstance.setRoyalties(secondDeploymentAddress, [
				{
					recipient: addr4.address,
					percentage: 4000
				}, {
					recipient: addr1.address,
					percentage: 26000
				}, 
			])).not.to.be.reverted;
		});

		it ("Should purchase a token and do splits correctly", async () => {
			const resaleInstance = await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address);
			const addr3resaleInstance = resaleInstance.connect(addr3);

			const args = [
				secondDeploymentAddress,	// erc721,
				addr3.address,				// buyer,
				owner.address,				// seller,
				0, 							// token,
				200000,						// tokenPrice
			]

			const hash = await resaleInstance.generateResaleHash(...[...args, nodeAddress.address]);

			const signedMessageOwner = await owner.signMessage(ethers.utils.arrayify(hash));
			await expect(
				await addr3resaleInstance.purchaseTokenOffer(...[...args, nodeAddress.address], signedMessageOwner, {value: 200000})
			)
				.to.emit(resaleInstance, 'TokenSold')
				.withArgs(...args)
				.changeEtherBalances([
					addr3,
					nodeAddress,
					treasuryAddress,
					addr4,
					addr1,
					owner,
				], [
					-200000,
					10000,
					10000,
					8000,
					52000,
					120000,
				])
		});

		it ("Shouldn't create resale offers if user is not owner of token", async () => {
			const resaleInstance = await ethers.getContractAt(
				'ResaleFacet',
				marketDiamondInstance.address
			);
			await expect(resaleInstance.createGasTokenOffer(
				secondDeploymentAddress, // ERC721 address
				0,						 // Token number
				300000,					 // Token Price
				nodeAddress.address		 // Node address
			)).to.be.revertedWith("Resale: Not the current owner of the token");
		});

		it ("Should create resale offers (stored in the blockchain)", async () => {
			const resaleInstance = (await ethers.getContractAt(
				'ResaleFacet',
				marketDiamondInstance.address
			)).connect(addr3);
			await expect(await resaleInstance.createGasTokenOffer(
				secondDeploymentAddress, // ERC721 address
				0,						 // Token number
				300000,					 // Token Price
				nodeAddress.address		 // Node address
			)).to.emit(resaleInstance, 'TokenOfferCreated')
				.withArgs(
					secondDeploymentAddress, // ERC721 address
					addr3.address,			 // Seller address
					0,						 // Token ID
					300000,					 // Token Price
					0						 // Offer ID
				)
			await expect(await resaleInstance.connect(owner).createGasTokenOffer(
					secondDeploymentAddress, // ERC721 address
					1,						 // Token number
					9000000,				 // Token Price
					nodeAddress.address		 // Node address
				)).to.emit(resaleInstance, 'TokenOfferCreated')
					.withArgs(
						secondDeploymentAddress, // ERC721 address
						owner.address,			 // Seller address
						1,						 // Token ID
						9000000,				 // Token Price
						1						 // Offer ID
					)
		});

		it ("Should display created offers", async () => {
			const resaleInstance = (await ethers.getContractAt(
				'ResaleFacet',
				marketDiamondInstance.address
			));
			const result = await resaleInstance.getResaleOffer(0);
			await expect(result.erc721).to.equal(secondDeploymentAddress);
			await expect(result.seller).to.equal(addr3.address);
			await expect(result.token).to.equal(0);
			await expect(result.tokenPrice).to.equal(300000);
		});

		it ("Should update offers", async () => {
			const resaleInstance = (await ethers.getContractAt(
				'ResaleFacet',
				marketDiamondInstance.address
			)).connect(addr3);
			await expect(await resaleInstance.updateGasTokenOffer(0, 500000))
				.to.emit(resaleInstance, 'TokenOfferUpdated')
				.withArgs(
					0,
					500000
				);
			const result = await resaleInstance.getResaleOffer(0);
			await expect(result.tokenPrice).to.equal(500000);
		});

		it ("Shouldn't update offers if user is not owner", async () => {
			const resaleInstance = (await ethers.getContractAt(
				'ResaleFacet',
				marketDiamondInstance.address
			)).connect(addr3);
			await expect(resaleInstance.updateGasTokenOffer(1, 500000))
				.to.be.revertedWith("Resale: Not the current owner of the token");
		});

		it ("Shouldn't delete offers if user is not owner", async () => {
			const resaleInstance = (await ethers.getContractAt(
				'ResaleFacet',
				marketDiamondInstance.address
			)).connect(addr3);
			await expect(resaleInstance.deleteGasTokenOffer(1))
				.to.be.revertedWith("Resale: Not the current owner of the token");
		});

		it ("Should delete offers", async () => {
			const resaleInstance = (await ethers.getContractAt(
				'ResaleFacet',
				marketDiamondInstance.address
			));
			await expect(await resaleInstance.deleteGasTokenOffer(1))
				.to.emit(resaleInstance, 'TokenOfferDeleted')
				.withArgs(1);
			const result = await resaleInstance.getResaleOffer(1);
			await expect(result.erc721).to.equal(ethers.constants.AddressZero);
		});

		it ("Shouldn't purchase resale offers without enough funds", async () => {
			const resaleInstance = await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address);
			await expect(resaleInstance.purchaseGasTokenOffer(
				0, // Offer Id
				{value: 300000}
			)).to.be.revertedWith("Resale: Insufficient funds!");
			await expect(await resaleInstance.connect(addr3).updateGasTokenOffer(0, 300000))
				.to.emit(resaleInstance, 'TokenOfferUpdated')
				.withArgs(
					0,
					300000
				);
		});

		it ("Should purchase resale offers (stored in the blockchain)", async () => {
			const resaleInstance = await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address);
			await expect(await resaleInstance.purchaseGasTokenOffer(
				0, // Offer Id
				{value: 300000}
			)).to.emit(resaleInstance, 'TokenSold')
				.withArgs(
					secondDeploymentAddress,	// erc721,
					owner.address,				// buyer,
					addr3.address,				// seller,
					0, 							// token,
					300000,						// tokenPrice
				)
				.changeEtherBalances([
					owner,	// Buyer
					nodeAddress,
					treasuryAddress,
					addr4,
					addr1,
					addr3, // Seller
				], [
					-300000,
					15000,
					15000,
					12000,
					78000,
					180000,
				])
		});

		it ("Shouldn't purchase resale offers twice", async () => {
			const resaleInstance = await ethers.getContractAt('ResaleFacet', marketDiamondInstance.address);
			await expect(resaleInstance.purchaseGasTokenOffer(
				0, // Offer Id
				{value: 300000}
			)).to.be.revertedWith("Resale: Offer already purchased")
		});
	});

	describe("Exchange", () => {
		it ("Shouldn't allow non admins to modify settings", async () => {
			const exchangeWithAddr1 = (exchangeInstance).connect(addr1);
			await expect(exchangeWithAddr1.updateERC20Address(erc20Instance.address))
				.to.be.revertedWith("AccessControlUnauthorizedAccount");
			await expect(exchangeWithAddr1.metadataConfig("asdasd", "json"))
				.to.be.revertedWith("AccessControlUnauthorizedAccount");
			await expect(exchangeWithAddr1.setPurchasePeriod(120))
				.to.be.revertedWith("AccessControlUnauthorizedAccount");
		});

		it ("Should setup all settings", async () => {
			await expect(await exchangeInstance.updateERC20Address(erc20Instance.address))
				.to.not.be.reverted;
			await expect(await exchangeInstance.metadataConfig("google.com/rair/", "json"))
				.to.not.be.reverted;
			await expect(await exchangeInstance.setPurchasePeriod(120))
				.to.not.be.reverted;
		});

		it ("Should generate hash and mint token", async () => {
			await erc20Instance.transfer(addr3.address, 2000);
			const hash = await exchangeInstance.generateLicenseHash(
				412, 			// Index,
				addr3.address, 	// Buyer,
				200				// Price
			);
			const signedHash = await owner.signMessage(ethers.utils.arrayify(hash));

			const exchangeWithAddr3 = (exchangeInstance).connect(addr3);
			const erc20WithAddr3 = (erc20Instance).connect(addr3);
			await erc20WithAddr3.approve(exchangeInstance.address, 400);

			await expect(await exchangeWithAddr3.mint(
				412, 			// Index
				200, 			// Price
				signedHash, 	// Hash
			)).to.emit(exchangeInstance, "Transfer")
				.withArgs(
					ethers.constants.AddressZero,
					addr3.address,
					412
				);
		});

		it ("Shouldn't mint token with the same hash twice", async () => {
			const hash = await exchangeInstance.generateLicenseHash(
				813, 			// Index,
				addr3.address, 	// Buyer,
				100				// Price
			);
			const signedHash = await owner.signMessage(ethers.utils.arrayify(hash));

			const exchangeWithAddr3 = (exchangeInstance).connect(addr3);

			// Shouldn't mint with invalid price
			await expect(exchangeWithAddr3.mint(
				813, 			// Index
				50, 			// Price
				signedHash, 	// Hash
			)).to.be.revertedWith('License Mint: Invalid signature');

			await expect(await exchangeWithAddr3.mint(
				813, 			// Index
				100, 			// Price
				signedHash, 	// Hash
			)).to.emit(exchangeInstance, "Transfer")
				.withArgs(
					ethers.constants.AddressZero,
					addr3.address,
					813
				);

			// Shouldn't mint again
			await expect(exchangeWithAddr3.mint(
				813, 			// Index
				100, 			// Price
				signedHash, 	// Hash
			)).to.be.revertedWith('ERC721InvalidSender');

			// Shouldn't mint the wrong number
			await expect(exchangeWithAddr3.mint(
				812, 			// Index
				100, 			// Price
				signedHash, 	// Hash
			)).to.be.revertedWith('License Mint: Invalid signature');

			// Shouldn't mint with the wrong user
			await expect(exchangeInstance.mint(
				813, 			// Index
				100, 			// Price
				signedHash, 	// Hash
			)).to.be.revertedWith('License Mint: Invalid signature');
			
		});

		it ("Shouldn't mint after time expires", async () => {
			const hash = await exchangeInstance.generateLicenseHash(
				901, 			// Index,
				addr3.address, 	// Buyer,
				100				// Price
			);
			const signedHash = await owner.signMessage(ethers.utils.arrayify(hash));

			const exchangeWithAddr3 = (exchangeInstance).connect(addr3);

			await time.increase(120);

			await expect(exchangeWithAddr3.mint(
				901, 			// Index
				100, 			// Price
				signedHash, 	// Hash
			)).to.be.revertedWith('License Mint: Invalid signature')
		});

	});

	describe("Multi Send", () => {
		it ("Should approve before sending", async () => {
			const approvalValue = 60;
			await expect(
				await erc20Instance.approve(
					marketDiamondInstance.address,
					approvalValue
				)
			).to.not.be.reverted;
			await expect(
				await erc20Instance.allowance(
					owner.address,
					marketDiamondInstance.address
				)
			).to.equal(approvalValue);
		});

		it ("Shouldn't send with invalid array sizes", async () => {
			const multiSendInstance = await ethers.getContractAt('MultiSendTool', marketDiamondInstance.address);
			await expect(
				multiSendInstance.multiSendERC20(
					erc20Instance.address,
					[owner.address, addr1.address],
					[1]
				)
			).to.be.revertedWith("MultiSend: Invalid array sizes");
			await expect(
				multiSendInstance.multiSendERC20(
					erc20Instance.address,
					[owner.address],
					[1, 1]
				)
			).to.be.revertedWith("MultiSend: Invalid array sizes");
		});

		it ("Should send to different recipients", async () => {
			const multiSendInstance = await ethers.getContractAt('MultiSendTool', marketDiamondInstance.address);
			await expect(await multiSendInstance.multiSendERC20(
				erc20Instance.address,
				[
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,

					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,

					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,

					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,

					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
				],
				[
					1,1,1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,1,1,
					1,1,1,1,1,1,1,1,1,1,
				] //60
			)).to.not.be.reverted;
			await expect(await erc20Instance.allowance(owner.address, marketDiamondInstance.address)).to.equal(0);
			await expect(await erc20Instance.balanceOf(owner.address)).to.equal(7940);
			await expect(await erc20Instance.balanceOf(addr1.address)).to.equal(10);
			await expect(await erc20Instance.balanceOf(addr2.address)).to.equal(10);
			await expect(await erc20Instance.balanceOf(addr3.address)).to.equal(1710);
			await expect(await erc20Instance.balanceOf(addr4.address)).to.equal(10);
			await expect(await erc20Instance.balanceOf(treasuryAddress.address)).to.equal(10);
			await expect(await erc20Instance.balanceOf(nodeAddress.address)).to.equal(10);
		});

		it ("Shouldn't send tokens without further approval", async () => {
			const multiSendInstance = await ethers.getContractAt('MultiSendTool', marketDiamondInstance.address);
			await expect(
				multiSendInstance.multiSendERC20(
					erc20Instance.address,
					[owner.address],
					[1]
				)
			).to.be.revertedWith("ERC20InsufficientAllowance");
		});

		it ("Should send tokens with the same amount", async () => {
			const approvalValue = 60;
			await expect(
				await erc20Instance.approve(
					marketDiamondInstance.address,
					approvalValue
				)
			).to.not.be.reverted;
			await expect(
				await erc20Instance.allowance(
					owner.address,
					marketDiamondInstance.address
				)
			).to.equal(approvalValue);


			const multiSendInstance = await ethers.getContractAt('MultiSendTool', marketDiamondInstance.address);
			await expect(await multiSendInstance.multiSendERC20SameAmount(
				erc20Instance.address,
				[
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					addr1.address,
					
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,
					addr2.address,

					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,
					addr3.address,

					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,
					addr4.address,

					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,
					treasuryAddress.address,

					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
					nodeAddress.address,
				],
				1  //60 tokens per user
			)).to.not.be.reverted;
			await expect(await erc20Instance.allowance(owner.address, marketDiamondInstance.address)).to.equal(0);
			await expect(await erc20Instance.balanceOf(owner.address)).to.equal(7880);
			await expect(await erc20Instance.balanceOf(addr1.address)).to.equal(20);
			await expect(await erc20Instance.balanceOf(addr2.address)).to.equal(20);
			await expect(await erc20Instance.balanceOf(addr3.address)).to.equal(1720);
			await expect(await erc20Instance.balanceOf(addr4.address)).to.equal(20);
			await expect(await erc20Instance.balanceOf(treasuryAddress.address)).to.equal(20);
			await expect(await erc20Instance.balanceOf(nodeAddress.address)).to.equal(20);
		});
	});

	describe("Loupe Facet", () => {
		it ("Should show all facets", async () => {
			const loupeFacet = await ethers.getContractAt('DiamondLoupeFacet', factoryDiamondInstance.address);
		})
	});
})
