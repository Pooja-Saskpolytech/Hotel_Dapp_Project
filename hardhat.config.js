require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks:{
    hardhat: {
      forking: {
        url: "https://eth-goerli.g.alchemy.com/v2/qMzuzjnXQqfWMNGaS16NUWN4g8GDu46h",
      }
    },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/qMzuzjnXQqfWMNGaS16NUWN4g8GDu46h",
      accounts: ["ea7499ba5c0633fd5a7bb7b50370509fabfed89aa48204494e2442770aed8bc5"]
     
    }
  }
};
