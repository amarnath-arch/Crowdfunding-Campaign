require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-waffle");
require('hardhat-dependency-compiler');

require('dotenv').config();

const GOERLI_RPC_URL = process.env.RPCURL;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks:{
    localhost:{ },
    goerli:{
      url: GOERLI_RPC_URL,
      accounts: PRIVATE_KEY.split(','),
    },
    mumbai:{
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: PRIVATE_KEY.split(','),
    }
  }
};
