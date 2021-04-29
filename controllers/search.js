const Ride = require("../models/Ride");
const Rider = require("../models/Rider");
const Booking=require("../models/Booking");
const User=require("../models/User");

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
    }
  }
}

async function getBookedUsers(req, res) {
  if (req.params.id) {
    let ride_id = req.params.id;
    //getting ride detail to get rider_id so only we can check if the req rider has acess to see
    let ride = await Ride.findOne({
      _id: ride_id
    });
  
    //allow only if rider has access but we bypass here so user can see 
    if (1) {
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
          search_page:true
        });
      
    }
  }
}
module.exports = {
  post,
  getSpecificRide,
  getBookedUsers
};