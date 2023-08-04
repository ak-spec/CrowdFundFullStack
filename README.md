# Getting Started
- Clone the repo if you want to run from local env
- Navigate to each of the 2 folders and run 'npm install' to install all dependencies

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
### Visit [deployed-app](https://crowd-fund-dapp-five.vercel.app/) or clone the repo and follow below steps to run from localhost:
1. Add a .env file containing Alchemy RPC_Url in the my-app folder

2. Navigate to front-end/my-app/context/constants.js and set the sepolia variable to true.
     command: cd front-end/my-app/context/constants.js
     change line 7 to -> sepolia = true

3. Open the terminal and start the server 
    command: npm run dev








