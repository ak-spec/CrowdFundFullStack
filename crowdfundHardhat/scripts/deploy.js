const {ethers, run, network} = require("hardhat")

// hardhat_contract_address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
// sepolia_contract_address: 0x2943478e845c240b81B4601d474F460f818243E3

// 0x15663148Ae4f2b0b2f52C5Ef25f1ec6CC53Ed9E6

async function verify(contractAddress, args) {
    try{
        await run("verify:verify", {
            address:contractAddress,
            constructorArguments: args
        })
    }catch(e){
        if(e.message.includes("already verified")){
            console.log("Contract is already verified")
        }else{
            console.log(e)
        }
    }
    
}

async function main() {
    const CrowdFundManager = await ethers.getContractFactory("CrowdFundManager");
    const crowdFundManager = await CrowdFundManager.deploy();
    await crowdFundManager.waitForDeployment();
    const address = await crowdFundManager.getAddress();
    console.log("This is the address where the contract is deployed: ", address)
    if(network.config.chainId !== 31337 && process.env.ETHERSCAN_API_KEY){
        await crowdFundManager.deploymentTransaction().wait(6);
        await verify(address, [])
        
    }
}

main()
.then(() => {
    process.exit(0);
})
.catch((error) => {
    console.log(error)
    process.exit(1)
})