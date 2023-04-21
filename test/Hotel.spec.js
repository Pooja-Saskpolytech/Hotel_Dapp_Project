// First, import the necessary packages
const { ethers } = require("hardhat");
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");



describe("Hotel", function () {
  let hotel;
  let owner;
  let user1;
  let user2;
  let token;
  const useFixedPricing = true;
  const bookingTokenPrice = ethers.utils.parseUnits("0.0001", "ether");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("BookingToken");
    const token = await Token.deploy(owner.address);

    await token.deployed();
    
    const Hotel = await ethers.getContractFactory("Hotel");
    hotel = await Hotel.deploy(useFixedPricing, bookingTokenPrice);
    await hotel.deployed();
    await hotel.attach(token.address); // link the Token contract to the Hotel contract


      });
     

  it("should set the correct values in the constructor", async function () {
    expect(await hotel.bookingTokenPrice()).to.equal(bookingTokenPrice);
    expect(await hotel.owner()).to.equal(owner.address);
  });

  
  it("should return the correct token price with fixed pricing", async function () {
    const fallbackValue = 1000 * 1e8; // set fallback value
    const tokenPrice = await hotel.getTokenPrice();
    const expectedPrice = (bookingTokenPrice * fallbackValue) / 1e18; // calculate expected price
    expect(tokenPrice.toString()).to.equal(expectedPrice.toString()); // compare values
  });
  

  it("should return the correct token price with dynamic pricing", async function () {
    const priceFeed = await ethers.getContractAt("AggregatorV3Interface", "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e");
    const { answer: price } = await priceFeed.latestRoundData();
    const decimals = await priceFeed.decimals();

    const ethToUsd = BigInt(price.toString());
    const etherPrice = 10000000;

    const tokenPrice = await hotel.getTokenPrice();
    expect(tokenPrice).to.equal(etherPrice);
});



  
  it("should allow user to buy token and return correct token balance", async function() {
    await hotel.connect(user1).buyTokens(1, { value: '1000000000000000' });        
  const balance = await hotel.getTokenBalance(user1.address);
  console.log(`balance: ${balance}`);
  expect(balance).to.equal(1);
  });

  it("should return an empty array when there are no bookings", async function() {
    const checkInDate = Math.floor(Date.now() / 1000); // use the current timestamp as the check-in date
    const checkOutDate = checkInDate + 86400; // add one day to the check-in date to get the check-out date
    const availability = await hotel.getRoomAvailability(checkInDate, checkOutDate);
    expect(availability).to.deep.equal([[ '0x0000000000000000000000000000000000000000' ]]);
  });
  it('should book a room successfully and return user bookings', async () => {
    const checkInDate = Math.floor(Date.now() / 1000) + 86400; // tomorrow
    const checkOutDate = checkInDate + (86400 * 2); // 2 days later
    const numDays = (checkOutDate - checkInDate) / 86400;
    const userName = 'John Doe';
    await hotel.connect(user1).buyTokens(3, { value: '3000000000000000' });    

    await hotel.connect(user1).bookRoom(userName, checkInDate, checkOutDate);
    const bookings = await hotel.viewUserBookings(user1.address);
    const booking = bookings[bookings.length - 1];
    expect(bookings.length).to.equal(1);
   
  });
  it('should return empty array for user bookings when there are no bookings', async () => {
    const bookings = await hotel.viewUserBookings(user2.address);
    expect(bookings).to.be.an('array').that.is.empty;
  });  
  it('should cancel a booking and refund tokens', async () => {
    const checkInDate = Math.floor(Date.now() / 1000) + 86400; // tomorrow
    const checkOutDate = checkInDate + (86400 * 1); // 1 days later
    const numDays = (checkOutDate - checkInDate) / 86400;
    const userName = 'John Doe';
    await hotel.connect(user1).buyTokens(3, { value: '3000000000000000' });    

    await hotel.connect(user1).bookRoom(userName, checkInDate, checkOutDate);
    const bookings = await hotel.viewUserBookings(user1.address);
    const booking = bookings[bookings.length - 1];
    const timestamp = booking.timestamp;
    const tokensBefore = await hotel.getTokenBalance(user1.address);
    await hotel.connect(user1).cancelBooking(timestamp);
  
    const bookingsAfter = await hotel.viewUserBookings(user1.address);
    expect(bookingsAfter.length).to.equal(bookings.length - 1);
    const tokensAfter = await hotel.getTokenBalance(user1.address);
    expect(tokensAfter).to.equal(tokensBefore.add(numDays));
    
  });
  it("should change the token price", async function () {
    // Set the initial token price to 100
    await hotel.changeTokenPrice(200);

       // Expect the token price to be 200
    expect(await hotel.bookingTokenPrice()).to.equal(200);
  });
  
});
