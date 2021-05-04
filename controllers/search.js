const Ride = require("../models/Ride");
const Rider = require("../models/Rider");
const Booking = require("../models/Booking");
const User = require("../models/User");

/* 
  DOING:
  1.get from to ...
  2.find match ride and render it 
  3.depend on the user or rider render the corresponding page

  TODO:
    1.if user not enter from to inform the user
  
  No of DB Read:1
*/
async function post(req, res) {
  if (req.body) {
    let {
      from,
      to,
      type,
      date
    } = req.body;
    type = type.toLowerCase();
    from = from.toLowerCase();
    to = to.toLowerCase();
    let rides = await Ride.find({
      from: from,
      to: to,
      date: {
        "$gte": date
      },
      type: type
    });
    if (req.user) {
      //if he is rider pass rider option
      if (req.user.licenseno) {
        res.render("searchResult", {
          rides,
          search: {
            from,
            to,
            type,
            date
          },
          rider: req.user
        });
        return
      }
    }
    res.render("searchResult", {
      rides,
      search: {
        from,
        to,
        type,
        date
      },
      user: req.user
    });

  }
  //say rider to enter the search options
}

/* 
  DOING:
  1.get ride id and based on ride get the ride doc and rider doc 
  2.based on type of user render the page
  
  No of DB Read:2
*/
async function getSpecificRide(req, res) {
  if (req.params.id) {
    let id = req.params.id;
    let ride = await Ride.findOne({
      _id: id
    });
    if (ride) {
      owner = await Rider.findOne({
        _id: ride.rider_id
      });
      if (req.user) {
        //if he is rider pass rider option
        if (req.user.licenseno) {
          res.render("vehicleDetail", {
            ride,
            owner: {
              id: owner._id,
              name: owner.name,
              profile: owner.profile
            },
            rider: req.user
          })
          return
        }
      }
      res.render("vehicleDetail", {
        ride,
        owner: {
          id: owner._id,
          name: owner.name,
          profile: owner.profile
        },
        user: req.user
      })
     return
    }
  }
  res.render("error");
}

/* 
  DOING:
  1.based ride id getting ride details (to find no of unbooked seats)
  2.getting booking detail based on ride id
  3.iterating booking doc to get the use id and no of passenger user booked and store it on the array 
  4.iterating user id array to getting user detail and store that in array and adding passenger count to user doc
  5.using ride doc finding no of seats are unbooked
  6.rendering all detail

  TODO:
    1.reduce the fetching of database

  No of DB Read:3 and  more depend on no of user booked
*/

async function getBookedUsers(req, res) {
  if (req.params.id) {
    let ride_id = req.params.id;
    //getting ride detail to get rider_id so only we can check if the req rider has acess to see
    let ride = await Ride.findOne({
      _id: ride_id
    });
    //getting booking to get the booked user id
    let booking = await Booking.find({
      ride_id: ride_id
    });
    let users_id = [];
    let users = [];
    let booked = 0
    booking.forEach((booking, i) => {
      //putting user id and no of passenger to array
      if (booking.ride_id) {
        users_id.push([booking.user_id, booking.passenger]);
      }
    });

    let length = users_id.length
    async function getUsers(index) {
      //getting the user data
      let user = await User.findOne({
        _id: users_id[index][0]
      });
      if (user) {
        //adding no of passenget to user obj
        user._doc.passenger = users_id[index][1];
        //adding to find total booked seats
        booked += users_id[index][1];
        users.push(user);
        if (index + 1 < length) {
          await getUsers(index + 1)
        }
      } else {
        if (index + 1 < length) {
          await getUsers(index + 1)
        }
      }
    }

    if (length) {
      await getUsers(0);
    }

    let unbooked = parseInt(ride.passenger) - parseInt(booked);
    res.render("bookedUsers", {
      seats: ride.passenger,
      booked: booked,
      unbooked: unbooked,
      users: users,
      rider: req.user,
      search_page: true
    });
  }
}

module.exports = {
  post,
  getSpecificRide,
  getBookedUsers
};