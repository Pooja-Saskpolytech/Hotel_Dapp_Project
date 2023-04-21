//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
/// @title A fixed-price hotel run on Ethereum. Includes a token + schedule system.
/// @author Pooja Vijayan Nair, Manpreet Kaur,Poojitha Mallikarjunaih
/// @notice 1 token is always = 1 day accomodation. The USD price of the token can change. 
/// @dev project to be used on Goerli test network

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";
import "./Token.sol";

contract Hotel{
using SafeMath for uint256;
using SafeMath for uint64;
AggregatorV3Interface internal priceFeed;
BookingToken public bookingToken;

bool private useFixedPricing;
uint64 public bookingTokenPrice;
uint256 fallbackValue = 1000 * 1e8;
address payable public owner;
mapping(address => UserBooking[]) public userBookings;
mapping(uint256 => Bookings) scheduleByTimestamp;

event Debug(uint256);
event ErrorOccurred(string error);
event TokenBought(address indexed from, uint256 sum, uint64 price);
event TokenPriceChanged(uint64 oldPrice, uint64 newPrice);
event RoomBooked(
        address indexed from,
        uint256 checkIn,
        uint256 checkOut
    );
event BookingCanceled(
        address indexed from,
        uint256 timestamp
    );

 struct Bookings {
        bool isAppointment;
        string userName;
        address userAddress;
    }
 struct UserBooking {
        uint256 timestamp;
        uint8 numDays;
    }

modifier onlyOwner() {
        require(msg.sender == owner, "owner restricted funtionality");
        _;
    }

constructor(
        bool _useFixedPricing,
        uint64 _tokenPrice

    ) {
        useFixedPricing = _useFixedPricing;
        bookingTokenPrice = _tokenPrice;
        owner = payable(msg.sender);
        bookingToken = new BookingToken(address(this));
        priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);


    }
 //function to get the price of token in ether using chainlink

function getTokenPrice() public view returns (uint256) {
    uint256 etherPrice = 0;
    uint decimals = priceFeed.decimals();

    if (!useFixedPricing) {
        try priceFeed.latestRoundData() returns (
            uint80,
            int256 price,
            uint256,
            uint256,
            uint80
        ) {

            // protect against overflows from the priceFeed since int can be negative
            require(price >= 0, "price for Ether cannot be negative");          
            uint ethToUsd = uint(price);


            // USDC needs 8 decimals added

            // get the price for 1 token
            etherPrice = (bookingTokenPrice * (ethToUsd/10 ** decimals)) / 1e18;

        } catch Error(string memory _err) {
            console.log(_err);
        }
    }
    // if useFixedPricing or priceFeed is down, use fallback value
    if (etherPrice == 0) {
        etherPrice = (bookingTokenPrice * fallbackValue) / (10 ** 18);
    }

    return etherPrice;
}


//function to buy token
/// @notice Allows user to buy a X tokens
function buyTokens(uint256 _numTokens) public payable {
    require(_numTokens > 0, "invalid number of tokens");
    require(msg.value > 0, "must send ether in request");

    uint256 etherPrice = getTokenPrice();
    uint256 totalPrice = etherPrice*_numTokens;
    require(msg.value >= totalPrice, "not enough ether sent in request");

    // transfers ETH to owner account
    (bool sent, ) = owner.call{value: msg.value}("");
    require(sent, "Failed to send Ether");

    bookingToken.mint(msg.sender, _numTokens);

    // use bookingTokenPrice for easy human-readable USD value
    emit TokenBought(msg.sender, _numTokens, bookingTokenPrice);
}
//function to get token balance

 function getTokenBalance(address _address) public view returns (uint256) {
        return bookingToken.balanceOf(_address);
}

//function to get room availability
function getRoomAvailability(uint256 _checkInDate, uint256 _checkOutDate) public view returns (address[][] memory) {
    // Calculate the number of days in the range
    uint8 numDays = uint8((_checkOutDate - _checkInDate) / 86400);

    // Initialize the array of appointment addresses for each day
    address[][] memory dailybookings = new address[][](numDays);

    // Loop through each day in the range
    for (uint8 i = 0; i < numDays; i++) {
        // Calculate the timestamp for the current day
        uint256 timestamp = _checkInDate + (i * 86400);

        // Get the appointments for the current day
        Bookings[] memory bookings = new Bookings[](1);
        bookings[0] = scheduleByTimestamp[timestamp];

        // Initialize an array to hold the appointment addresses for the current day
        address[] memory bookingAddresses = new address[](bookings.length);

        // Loop through each appointment for the current day
        for (uint8 j = 0; j < bookings.length; j++) {
            bookingAddresses[j] = bookings[j].userAddress;
        }

        // Store the array of appointment addresses for the current day in the dailyAppointments array
        dailybookings[i] = bookingAddresses;
    }

    // Return the array of appointment addresses for each day in the range
    return dailybookings;
}

//function to book room
function bookRoom(string memory _userName, uint256 _checkInDate, uint256 _checkOutDate) public {
    // Calculate the number of days in the booking
    uint8 numDays = uint8((_checkOutDate - _checkInDate) / 86400);

       // Burn the required number of tokens
    bookingToken.burn(msg.sender, numDays);
    uint256 timestamp;
    // Loop through each day of the booking
    for (uint8 i = 0; i < numDays; i++) {
        // Calculate the timestamp for the current day
        timestamp = _checkInDate + (i * 86400);

                // Add the booking to the schedule for the current day
        scheduleByTimestamp[timestamp] = Bookings(
                true,
                _userName,
                msg.sender
            );
    }
    userBookings[msg.sender].push(UserBooking(timestamp,numDays));

    // Emit an event to indicate that the room has been booked
    emit RoomBooked(msg.sender, _checkInDate, _checkOutDate);
}

//function to view an users booking 


function viewUserBookings(address _addr) public view returns (UserBooking[] memory)
{
    return userBookings[_addr];
}
//function to cancel booking 

function cancelBooking(uint256 _timestamp) public {
    // Get the booking for the specified timestamp
    Bookings storage booking = scheduleByTimestamp[_timestamp];

    // Require that the booking exists and was made by the caller
    require(booking.isAppointment, "No booking exists for the specified timestamp");
    require(booking.userAddress == msg.sender, "Only the user who made the booking can cancel it");

    // Calculate the number of days in the booking
    uint8 numDays = uint8((_timestamp - block.timestamp) / 86400);

    // Mint the required number of tokens as a refund
    bookingToken.mint(msg.sender, numDays);

    // Loop through each day of the booking
    for (uint8 i = 0; i < numDays; i++) {
        // Calculate the timestamp for the current day
        uint256 currentTimestamp = _timestamp + (i * 86400);

        // Remove the booking from the schedule for the current day
        delete scheduleByTimestamp[currentTimestamp];
    }

    // Remove the booking from the user's list of bookings
    UserBooking[] storage userBookingsArray = userBookings[msg.sender];
    for (uint i = 0; i < userBookingsArray.length; i++) {
        if (userBookingsArray[i].timestamp == _timestamp) {
            userBookingsArray[i] = userBookingsArray[userBookingsArray.length - 1];
            userBookingsArray.pop();
            break;
        }
    }

    // Emit an event to indicate that the booking has been canceled
    emit BookingCanceled(msg.sender, _timestamp);
}

 function changeTokenPrice(uint64 _newPrice) public onlyOwner {
        require(_newPrice > 0, "New price must be more than zero");
        // emit an event w/ new and old values
        emit TokenPriceChanged(bookingTokenPrice, _newPrice);
        //check if msg.sender have minter role
        bookingTokenPrice = _newPrice;
    }

}