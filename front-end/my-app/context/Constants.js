import CrowdFundManager from "./CrowdFundManager.json"


// hardhat_contract_address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
// sepolia_contract_address: 0x2943478e845c240b81B4601d474F460f818243E3

//sepolia adrress 2: 0x15663148Ae4f2b0b2f52C5Ef25f1ec6CC53Ed9E6

const sepolia = true;
export const CROWDFUND_ABI = CrowdFundManager.abi;
export const CROWDFUND_CONTRACT_ADDRESS = sepolia ? "0x15663148Ae4f2b0b2f52C5Ef25f1ec6CC53Ed9E6" : "0x5FbDB2315678afecb367f032d93F642f64180aa3";







































                                          