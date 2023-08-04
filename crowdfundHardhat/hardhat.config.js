/** @type import('hardhat/config').HardhatUserConfig */

require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

const ALCHEMY_SEPOLIA_URL = process.env.ALCHEMY_API_KEY || ""
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || "0xprivatekey"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const COINMAERKETCAP = process.env.COINMAERKETCAP_API_KEY || "key"

module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
  networks: {
    sepolia : {
      url: ALCHEMY_SEPOLIA_URL,
      chainId: 11155111,
      accounts: [SEPOLIA_PRIVATE_KEY]
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337
    }
  },
  etherscan: {
    apiKey : {
      sepolia: ETHERSCAN_API_KEY,
    },
  },
  gasreporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: COINMAERKETCAP,
  }
};
