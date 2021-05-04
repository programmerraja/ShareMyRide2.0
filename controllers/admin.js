//node modules
const passport = require("passport");
//util
const {
  AppError
} = require("../util/util");
//models
const Rider = require("../models/Rider");
const User = require("../models/User");

/* 
  DOING:
  1. simply rendering
  
*/
function get(req, res) {
  res.render("admin", {
    rider: req.user
  });
}

/* 
  DOING:
  1.return all rider as json
  
  No of DB Read:1
*/
async function getRiders(req, res) {
  let riders = await Rider.find({});
  res.json({
    status: "Sucess",
    riders: riders
  });
}

/* 
  DOING:
  1.get rider id and render rider doc and his ride doc

  No of DB Read:2
*/
async function getRider(req, res) {
  if (req.params.id) {
    let rider_id = req.params.id;
    let rides = await Ride.find({
      rider_id: rider_id
    });
    let rider = await Rider.findOne({
      _id: rider_id
    });
    if (rides && rider) {
      res.render("adminRider", {
        rider: req.user,
        rider_profile: rider,
        rides,
      });

    }
    return;
  }
  res.render("error");
}

/* 
  DOING:
  1. get rider id and remove the ride based on ride id
  2.also remove the booking doc related to the ride 

 TODO:
    1. inform the rider about we removed the  ride and reason

  NO of DB Delete:2
*/
async function removeRide(req, res) {
  if (req.body.id) {
    let ride_id = req.body.id;
    let ride = await Ride.deleteOne({
      _id: ride_id,
    });
    let booking = await Booking.deleteMany({
      ride_id: ride_id
    });
    //need to show rider if some thing bad for better use js in client side
    if (ride && booking) {
      res.json({
        "status": "Sucess",
        msg: "Successfully Removed"
      });
    } else {
      res.json({
        "status": "Failure",
        msg: "Sorry Something went wrong!"
      });
    }
    return;
  }
  res.render("error");
}

/* 
  DOING:
  1.get rider id and delete the rider doc 
  2.based on rider id remove his posted ride also

  TODO:
    1. inform the user about we removed the rider and reason

  NO of DB Delete:1 and more depend on no of ride posted
*/
async function removeRiderById(req, res) {
  if (req.body.id) {
    let rider_id = req.body.id;
    let rider = await Rider.deleteOne({
      _id: rider_id
    });
    //remove ride also
    let ride = await Ride.deleteMany({
      rider_id: rider_id
    });
    if (rider) {
      res.json({
        status: "Sucess",
        msg: "sucessfully removed"
      });
    }
  } else {
    res.json({
      status: "Failure",
      msg: "Don't be fool!"
    })
  }
}

/* 
  DOING:
  1.get rider id and update his verified as true

  NO of DB Write:1
*/
async function verifiyRiderById(req, res) {
  if (req.body.id) {
    let rider_id = req.body.id;
    let rider = await Rider.findOneAndUpdate({
      _id: rider_id
    }, {
      is_verified: true
    });
    if (rider) {
      res.json({
        status: "Sucess",
        msg: "sucessfully Verified"
      });
    }
  } else {
    res.json({
      status: "Failure",
      msg: "Don't be fool!"
    })
  }
}

/* 
  DOING:
  1.return all user as json
 
  No of DB Read:1
 
*/
async function getUsers(req, res) {
  let users = await User.find({});
  res.json({
    status: "Sucess",
    users: users
  });
}

/* 
  DOING:
  1.get user id 
  2.find all booking that made by the user 
  3.get the user 
  4. iterate through all the booking and put rider id and no of passenger booked in array
  5. based on ride id array fetch all the ride detail that user booked
  6.overwritng no of passenger in ride by no of passenger user is booked 
  7.render the user doc and rides he booked doc

  TODO:
    1.
  
  No of DB Read:2 and more based on no of ride he booked 
*/
async function getUser(req, res) {
  if (req.params.id) {
    let user_id = req.params.id;
    //getting all booking done by user
    let booking = await Booking.find({
      user_id: user_id
    });
    let user_profile = await User.findOne({
      _id: user_id
    });
    //to store all [rides id and passenger count] 
    let rides_id = []
    let rides = []
    booking.forEach((booking, i) => {
      //putting id and passenger in array
      if (booking.ride_id) {
        rides_id.push([booking.ride_id, booking.passenger])
      }
    });
    let length = rides_id.length
    async function getRides(index) {
      //getting the ride id 
      let ride = await Ride.findOne({
        _id: rides_id[index][0]
      });
      if (ride) {
        //over writing no of passenger to no of passenger he booked if it is car
        ride.passenger = rides_id[index][1];
        rides.push(ride);
        if (index + 1 < length) {
          await getRides(index + 1)
        }
      } else {
        if (index + 1 < length) {
          await getRides(index + 1)
        }
      }
    }
    //used recursion function so only we can use async await 
    //call only if the booking avalible
    if (length) {
      await getRides(0);
    }
    res.render("adminUser", {
      rider: req.user,
      user_profile: user_profile,
      rides
    });
    return
  }
  res.render("error");
}

/* 
  DOING:
  1.get user id and remove the user doc and he booked doc

  TODO:
    1. inform the rider about we removed the  user 
  
  NO of DB Delete:1
*/
async function removeUserById(req, res) {
  if (req.body.id) {
    let user_id = req.body.id;
    let user = await User.deleteOne({
      _id: user_id
    });
    //remove ride also
    let booking=await Booking.deleteMany({ user_id: user_id});
    if (user ) {
      res.json({
        status: "Sucess",
        msg: "sucessfully removed"
      });
    }
  } else {
    res.json({
      status: "Failure",
      msg: "Don't be fool!"
    })
  }
}

module.exports = {
  get,
  getRiders,
  getRider,
  removeRide,
  removeRiderById,
  verifiyRiderById,
  getUsers,
  getUser,
  removeUserById,
};