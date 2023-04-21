// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  //const unlockTime = currentTimestampInSeconds + 60;

  //const lockedAmount = hre.ethers.utils.parseEther("0.001");
  const useFixedPricing = true;
  const bookingTokenPrice = ethers.utils.parseUnits("0.0001", "ether");
  
  const [owner] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("BookingToken");
  const token = await Token.deploy(owner.address);

  console.log("Token deployed to:", token.address);

  // Deploy the Hotel contract and pass the BookingToken address as a parameter
  const Hotel = await ethers.getContractFactory("Hotel");
  const hotel = await Hotel.deploy(useFixedPricing, bookingTokenPrice);



  await hotel.deployed();

  console.log(
    `Hotel with ${ethers.utils.formatEther(
      bookingTokenPrice
    )}ETH  deployed to ${hotel.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
