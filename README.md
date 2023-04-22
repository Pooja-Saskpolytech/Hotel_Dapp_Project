# Run Project
Front end of the project is not fully integrated with the contracts.Please follow the below steps to test and run the project in Remix.

Steps to run in Remix.
To make this project to run follow the below steps.
Deploy the contract by entering two values with deploy(booleanValue,etherValue)
(true,1000000000000000) true to use fixed value
(false,100000000000000) false for using pricefeedValue'

Flow of execution

1.View current token price
Execute GetTokenPrice

2.Buy Token 
Copy the output of previous step and  put it in VALUE field
Enter number of token you want to buy in buyTokens method and click it.

3.Get Token Balance
Execute the getTokenBalance method and confirm that token blance is updated.

4.See room availability
Execute the function getRoomAvailability by entering checkin and checkout date to see the room availability.
Dates should be eneterd in timestamp format.

5.Book Room
For booking room enter name ,checkin and check out date.
https://www.epochconverter.com/ use this for conversion
Dates should be enterd in timestamp format.
Select dates with atleast 24 hours difference.

6.See bookings
See the bookings of user buy clicking viewUserBookings

7.Cancel Booking
Enter checkin date for canceling booking

----------------------------------
Admin Only function

1.Change token price
Enter new token price and execute the function to change the token price.Only owner can execute it.
