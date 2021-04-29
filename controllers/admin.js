//node modules
const passport = require("passport");
//util
const {
  AppError
} = require("../util/util");
//models
const Rider = require("../models/Rider");
const User = require("../models/User");


//handling GET /signin
function get(req, res) {
  res.render("admin", {
    rider: req.user
  });

}

async function getRiders(req, res) {
  let riders = await Rider.find({});
  res.json({
    status: "Sucess",
    riders: riders
  });
}

async function getRider(req, res) {
  if(req.params.id){
    let rider_id = req.params.id;
    let rides = await Ride.find({
      rider_id: rider_id
    });
    console.log(rides,"ss")
    if (rides) {
      res.render("myRides", {
        rider: req.user,
        rides,
        admin:true
      });
      return
    }
    //render 404
    res.render("error");
}

}


async function removeRiderById(req, res) {
  if (req.body.id) {
    let rider_id = req.body.id;
    let rider = await Rider.deleteOne({
      _id: rider_id
    });
    //remove ride also
    let ride=await Ride.deleteMany({ rider_id: rider_id});
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
// for user

async function getUsers(req, res) {
  let users = await User.find({});
  res.json({
    status: "Sucess",
    users: users
  });
}

async function getUser(req, res) {
  if(req.params.id){
      let user_id = req.params.id;
      //getting all booking done by user
      let booking = await Booking.find({
        user_id: user_id
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
      res.render("BookedRides", {
        rider: req.user,
        rides
      });
  return
  }
  res.render("error");


}
async function removeUserById(req, res) {
  if (req.body.id) {
    let user_id = req.body.id;
    let user = await User.deleteOne({
      _id: user_id
    });
    //remove ride also
    // let ride=await deleteMany({ user_id: user_id,});
    if (user) {
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
  removeRiderById,
  verifiyRiderById,
  getUsers,
  getUser,
  removeUserById,
};