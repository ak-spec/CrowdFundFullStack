# Getting Started
-Clone the repo 
-run 'npm install' to install all dependencies in each of the 2 folders
1. Add an .env file to both crowdFundHardhat and front-end/my-app folder
###Things needed in the .env files : 
* Alchemy API KEY 


## hardhat set-up:
### Make sure u have added the hardhat network to metamask before carrying on:
click on this [link](https://medium.com/@kaishinaw/connecting-metamask-with-a-local-hardhat-network-7d8cea604dc6) for a guide to adding networks

1. Navigate to crowdFundHardhat folder
    command : cd crowdFundHardhat

2. Start the hardhat local blockchain using this command:
    command : npx hardhat node

3. Split the terminal and deploy the contract
    command: npx hardhat run scripts/deploy.js --network localhost

4. Open a new terminal and navigate to front-end/my-app/context/constants.js and set the sepolia variable to true.
     command: cd front-end/my-app/context/constants.js
     change line 7 -> sepolia = false

5. Start the server 
     command: npm run dev

6. Enter the url(http://localhost:3000) shown in the browser to start interacting with the dapp


## Sepolia set-up

1. Navigate to front-end/my-app/context/constants.js and set the sepolia variable to true.
     command: cd front-end/my-app/context/constants.js
     change line 7 -> sepolia = true

2. Open the terminal and start the server 
    command: npm run dev








