# Run Project

Steps to run in Remix.
To use this project in run before deploy enter two values with deploy(booleanValue,etherValue)
(true,1000000000000000) true to use fixed value
(false,100000000000000) false for using pricefeedValue'

Flow of execution

1.GetTokenPrice

2. Buy Token 
copy the output of previous step and  put in VALUE field
Enter number of token you want to buy in buy method and click it.

3.Get Token Balance
Click the button and confirm that token blance is updated

4. Book Room
For booking room enter name ,checkin and check out date in epoch
https://www.epochconverter.com/ use this for conversion

5.See bookings
See the bookings of user buy clicking viewUserBookings

6.Cancel Booking
To cancel booking you should have booking atleast for one night,
Enter checkin date for canceling booking

----------------------------------
Admin Only function

1.Change token price
Enter new token price and execute the function to change the token price.Only owner can execute it.