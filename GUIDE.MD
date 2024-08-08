# Setup guide
## Installing NPM
Recommended for easier use: install NVM (Node Version Manager), this will allow you to install and switch between Node versions, installation is different for each OS.

## Setup
* Navigate to `/diamond-contracts` directory
* Run `nvm use` , this will read the `.nvmrc` file in the folder and install the appropriate Node version
* Once Node is installed run `npm i` to install all necessary packages.
* Rename `sample.env` file to `.env` in the folder, fill all values (RPC endpoints, API keys, Private Key for the deployer account)
* To test the smart contracts use the command `npm run test`, this will compile all contracts and make sure the environment values are working correctly

## Configuring chains
* All configurations are in the `/diamond-contracts/hardhat.config.js` file
* To add a new blockchain you must add the RPC and Block explorer data of the chain
* The RPC information must be added in the networks field of the config, identify the chain with the chain's 0x identifier (`0x1` for Eth mainnet and so on), this is important for the deployment process.
* You can specify a private key for each chain, but there's a reusable object that you can destructure
* The block explorer data includes the API key of the chain explorer, this is important for the verification of the source code. It must be added on the `etherscan.apiKey` field of the config
* Run `npx hardhat verify --list-networks` to see all supported chains, if the new chain does not appear you must add it manually to the `etherscan.customChains` field, you will need to provide the name, numerical id, api endpoint and browser url of the chain

## Deployments
* The deployment process reads the files in `/diamond-contracts/deploy`, it will read the files in alphabetical order, which is why the `1.Facets.js` file is named like that
* It will go through each of the names in Facets and use the a helper to deploy and verify each of the facets
* Once all facets are deployed it will move on to the ERC20Exchange, Factory, Marketplace, ERC20 and FacetSource contracts respectively.
* Hardhat will be able to tell if a contract has already been deployed, so if the process is interrupted for any reason it will not redeploy everything again on the second run, as long as the contract's source code hasn't changed
* It will only try to verify the contract if the deployment happened on the current run, so to verify an already deployed contract you will need to tweak the code a bit
* To ignore the checking, deploying and verification of each facet and contract in the list you can also modify the code, be it with return statements on each .js files or just commenting out the names of the facets.
* There are separate commands to deploy on each blockchain, to see all available commands use the npm run command
* Deployment scripts on testnets are called deploy-{blockchain} i.e. `deploy-sepolia`
* Deployment scripts for testnets are called PAYABLE-deploy-{blockchain} i.e `PAYABLE-deploy-ethereum`, it makes it easier to identify and harder to call by accident
* You will have to add additional commands when a blockchain is added, the underlying command will be "npx hardhat --network {chain hash} deploy" i.e. `npx hardhat --network 0xaa36a7 deploy`
* The process is automatic, you will be able to see the resulting 0x address of the contract and the status of the verification and a link to the block explorer's source code page
![Deployment example](/assets/images/deploymentexample.png)
* The deployment of the DiamondCut facet is priority when deploying on a new blockchain, as it will be used to deploying the main contracts of the Factory, Marketplace and FacetSource
* On the deployment of the ERC20 you must add the address of the contract's owner and the amount of tokens to be minted on deploy
* The resulting ABIs will be generated on the `/diamond-contracts/deployments/` directory, the folder will have the same identifier as the hardhat config (which should be the 0x identifier of the chain)

## Connecting facets
For ease of use the `diamond-manager` folder has a basic React frontend to manage diamond facets

* Copy the deployments directory from `diamond-contracts` to `diamond-manager`
* Run `npm i` to install all components
* Run `npm start` to deploy a local frontend
* Use the dropdown menu to select a diamond contract, the frontend will display all of it's related facets
* Each of the functions from the facet will be displayed, you must select them all (by clicking on them) and pressing the 'Add' button
    * Selected functions are colored green
    * Functions connected to the diamond will have a blue border
    * Functions that exist in name in the diamond but are not coming from the current facet will have a green border
    * Functions that are not connected will have a red border
![Manager Example](/assets/images/manager.png)
* The Add functionality will fail if one of the functions already exists in the diamond, use the Replace button for these functions, you can also Remove functions
* Always add the functions from the Loupe facet first, that is how we can query the diamond and tell which functions are available
* There are 7 functions used by the AccessControl standard: getRoleAdmin, getRoleMember, getRoleMemberCount, grantRole, hasRole, renounceRole, revokeRole, these functions are available directly on the main diamond contract so they are not necessary to add, this can save gas at the time of connecting the facets.
* `rair-front` will need the combined ABI from each contract, use the Combine ABI button at the bottom of the page to generate the file, then move it to the appropriate folder.