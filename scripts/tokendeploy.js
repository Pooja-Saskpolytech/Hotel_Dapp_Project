const { ethers } = require("hardhat");

async function main() {
  const [owner] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("BookingToken");
  const token = await Token.deploy(owner.address);

  console.log("Token deployed to:", token.address);
}

main();
