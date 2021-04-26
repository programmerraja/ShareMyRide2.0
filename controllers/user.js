//node modules
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Grid = require('gridfs-stream');
//models
const Ride = require("../models/Ride");
const Rider = require("../models/Rider");
const Booking = require("../models/Booking");
const Alert = require("../models/Alert");
const User = require("../models/User");



//db
var conn = mongoose.createConnection(process.env.DBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
// Initialize GridFS
let gfs;
conn.once('open', () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('profiles');
});

//util
const {
  dbErrorHandler,
  sendBookRideMail,
  sendUnBookRideMail,
  generateToken,
  sendPasswordReset
} = require("../util/util");

//handling GET /signin
function get(req, res) {
  res.render("userProfile", {
    user: req.user
  });
}

function getProfilePicture(req, res) {
  gfs.files.findOne({
    filename: req.params.name
  }, (err, file) => {
    if (!file || file.length === 0) return res.status(404).json({
      err: 'No file exists'
    });
    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image'
      });
    }
  });
}
//handling GET /user/logout
function logout(req, res) {
  req.session.destroy();
  res.redirect("/");
}

async function post(req, res) {
  //if user change his mail  send the confirmation message
  if (res.locals.is_correct) {
    let {
      name,
      email,
      password,
      new_password,
      whatsappno
    } = req.body;
    //don't remove this 
    let old_password = password;

    let user_id = req.user._id;

    let user = await User.findOne({
      _id: user_id
    });

    if (user) {
      if (bcrypt.compareSync(old_password, user.password)) {
        if (new_password) {
          new_password = bcrypt.hashSync(new_password, 2);
          user.password = new_password;
        }
        user.name = name;
        user.email = email;
        user.whatsappno = whatsappno;
        if (req.file) {
          user.profile = req.file.filename;
        }
        user = await user.save().catch((err) => {
          let msg = dbErrorHandler(err)
          res.render("userProfile", {
            user: req.user,
            name: req.user.name,
            msg: msg
          });
        });
        if (user) {
          res.render("userProfile", {
            user: user,
            msg: "Sucess fully updated"
          });
        }

      } else {
        res.render("userProfile", {
          user: req.user,
          msg: "Password does not match"
        });
      }
    }
    return;
  }
  if (!req.body.password) {
    res.render("userProfile", {
      user: req.user,
      msg: "Please provide password to update your account"
    });
    return;
  }
  res.render("userProfile", {
    user: req.user,
    msg: "Please provide all data"
  });

}

async function getMyBookedRides(req, res) {
  let user_id = req.user._id;
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
    user: req.user,
    rides
  });
  return


}

async function bookARide(req, res) {
  if (req.params.id) {
    let ride_id = req.params.id;
    let ride = await Ride.findOne({
      _id: ride_id
    });
    if (ride) {
      res.render("bookARide", {
        user: req.user,
        max_passenger: ride.passenger,
        id: ride_id,
        type: ride.type
      });
      return
    }
  }
  //render 404 
  res.render("error");
}

async function postBookARide(req, res) {
  let {
    id,
    passenger,
    message
  } = req.body;
  if (id && message) {
    //getting ride
    let ride = await Ride.findOne({
      _id: id
    });
    //if the ride is full simply return booked
    if (ride.status === "Booked") {
      res.json({
        status: "Failure",
        msg: "seats all are booked"
      });
      return
    }
    //if user booking rider we need to check the passenger count
    if (ride.type === "taxi" && passenger) {
      //checking if the user entered more seats then rider given
      if (Number(passenger) > Number(ride.passenger_left)) {
        res.json({
          status: "Failure",
          msg: "seats are exceed"
        });
        return
      }
    }
    //getting a rider detail to get email of rider
    let rider = await Rider.findOne({
      _id: ride.rider_id
    });
    if (rider) {
      let to_mail = rider.email;
      //user data
      let user_data = {
        name: req.user.name,
        whatsappno: req.user.whatsappno,
        passenger: passenger,
        message: message
      };
      //link for the ride 
      let link = req.protocol + "://" + req.get("host") + "/search/ride/id/" + ride._id;

      //calculating balance seats if he booked taxi
      if (ride.type === "taxi" && passenger) {
        let seats = Number(ride.passenger_left) - Number(passenger);
        if (seats) {
          ride.status = seats + " Seats Left"
        }
        //if no seat 
        else {
          ride.status = "Booked";
        }
        ride.passenger_left = seats;
      }
      //if user book truck simply update staus as booked
      else {
        ride.status = "Booked";
      }
      ride.booked_id = req.user._id;
      //1.updating ride data (status,passenger_left)
      ride = await ride.save().catch((err) => {
        let msg = dbErrorHandler(err);
        res.json({
          status: "Failure",
          msg: msg
        });
      });
      if (ride) {
        //2. Second creating booking data
        //checking if user booking same ride as second time
        let booking = await Booking.findOne({
          user_id: req.user._id,
          ride_id: ride._id
        });
        //if user alreday booked same ride simply add the no of passenger
        if (booking) {
          //if user booking taxi
          if (booking.passenger) {
            booking.passenger = Number(passenger) + Number(booking.passenger);
          }
          //if user booking truck
          else {
            booking.passenger = null;
          }
        }
        //if user book the first time 
        else {
          booking = new Booking({
            user_id: req.user._id,
            ride_id: ride._id,
            passenger: passenger
          });
        }
        //adding (user_id rider_id ,passenger count) 
        //if this failed we need to rollback ride data
        booking = await booking.save().catch((err) => {
          let msg = dbErrorHandler(err);
          res.json({
            status: "Failure",
            msg: msg
          });
        });
        if (booking) {
          let msg = await sendBookRideMail(to_mail, rider.name, user_data, link);
          //todo if email fail we need to rollback
          if (msg) {
            res.json({
              status: "Sucess",
              msg: "Successfully Booked"
            });
            return
          }
          // else{
          // 	res.json({status:"Failure",msg:"Sorry For We Unable To Send Mail To Rider"});

          // }
        }
      }
      //if  ride failed we need to rollback 	
    }
    //if no rider
    else {
      res.json({
        status: "Failure",
        msg: "Sorry Rider is not avalible"
      })
    }
  }
  //if user not provide data simply ignore it 
}
async function unBookMyRide(req, res) {
  if (req.body.id) {
    let ride_id = req.body.id;
    let user = req.user;
    let user_id = user._id;
    let booking = await Booking.findOne({
      ride_id: ride_id,
      user_id: user_id
    });
    let passenger = booking.passenger;
    if (booking) {
      let ride = await Ride.findOne({
        _id: ride_id
      })
      if (ride) {
        //adding back the booked passenger to ride and setting status 
        let passenger_left = Number(ride.passenger_left) + Number(passenger);
        ride.passenger_left = passenger_left;
        //need to check if the passenger left == passenger then we need to put unbooked
        if (passenger_left === ride.passenger) {
          ride.status = "unbooked";
        } else {
          ride.status = passenger_left + " Seats Left"
        }
        ride = await ride.save().catch((err) => {
          let msg = dbErrorHandler(err);
          res.json({
            status: "Failure",
            msg: msg
          });
        });
        if (ride) {
          let booking = await Booking.deleteOne({
            ride_id: ride_id,
            user_id: user_id
          });
          if (booking) {
            //getting a rider detail to get email of rider
            let rider = await Rider.findOne({
              _id: ride.rider_id
            });
            if (rider) {
              let to_mail = rider.email;
              //user data
              let user_data = {
                name: req.user.name,
                whatsappno: req.user.whatsappno,
                passenger: passenger
              };
              //link for the ride 
              let link = req.protocol + "://" + req.get("host") + "/search/ride/id/" + ride._id;
              let msg = await sendUnBookRideMail(to_mail, rider.name, user_data, link);
              if (msg) {
                res.json({
                  "status": "Sucess",
                  msg: "Successfully Unbooked"
                });
                return;
              }
              //this send the response and also the errorhandler also 
              //send res it cause error
              // else{
              // 	//if failed we need to rollback
              //    						res.json({status:"Failure",msg:"Sorry For We Unable To Send Mail To Rider"});
              //      			}
            }
          }
        }
      }
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

async function setAlertOnSearch(req, res) {
  if (req.body.from && req.body.to && req.body.date && req.body.user_id && req.body.type) {
    //creating new alert
    //converting to lower case
    let user_id = req.body.user_id;
    let from = req.body.from.toLowerCase();
    let to = req.body.to.toLowerCase();
    let type = req.body.type.toLowerCase();
    let date = req.body.date;

    let new_alert = new Alert({
      user_id,
      from,
      to,
      type,
      date
    });
    new_alert = await new_alert.save()
    if (new_alert) {
      res.json({
        "status": "Sucess",
        "msg": "Alert Created Successfully"
      });
    } else {
      res.json({
        "status": "Failure",
        "msg": "Sorry Something went wrong!"
      });
    }

  } else {
    res.json({
      "status": "Failure",
      "msg": "You missed some input"
    });
  }
}

async function unSetAlertOnSearch(req, res) {
  if (req.params.id) {
    let id = req.params.id;
    let alert = await deleteOne({
      _id: id
    });
    if (alert) {
      res.json({
        status: "Successfully Unalerted"
      });
    } else {
      res.json({
        status: "Something went wrong"
      });

    }
  }
}

function forgetPassword(req, res) {
  res.render("forgetPassword");

}
//handling POST /user/forget/password
async function postForgetPassword(req, res) {
  if (req.body.email) {
    let email = req.body.email;
    var user = await User.findOne({
      email: email
    });
    if (user) {
      let token = generateToken();
      let link = req.protocol + "://" + req.get("host") + "/user/reset/password/" + token;

      //we adding 20 mins to current date and converting in to mili sec
      let password_reset_expires = Date.now() + 20 * 60 * 1000;
      //updating the user token
      let new_user = await User.findOneAndUpdate({
        _id: user._id
      }, {
        password_reset_token: token,
        password_reset_expires: password_reset_expires
      });

      //sending mail to user
      let msg = await sendPasswordReset(user.email, user.name, link);
      if (msg) {
        res.json({
          status: "Sucess",
          msg: "Check your mail to reset the password"
        });
      } else {
        res.json({
          status: "Failure",
          msg: "Sorry Something went wrong. Please try again"
        });
      }
      return
    }
    res.json({
      status: "Failure",
      msg: "No user exit with given gmail"
    })
    return
  }
  res.render("error");

}

//handling GET /user/reset/password
async function resetPassword(req, res) {
  res.render("resetPassword");
}

//handling POST /user/reset/password
async function postResetPassword(req, res) {

  if (req.params && req.body.password) {

    let password_reset_token = req.params.id;
    let new_password = req.body.password;
    //finding the user
    var user = await User.findOne({
      password_reset_token: password_reset_token,
      password_reset_expires: {
        $gt: Date.now()
      }
    });
    if (user) {
      let hash = bcrypt.hashSync(new_password, 2);
      let new_user = await User.findOneAndUpdate({
        _id: user._id
      }, {
        password: hash
      });
      res.json({
        status: "Sucess",
        msg: "Password Updated"
      });
    } else {
      res.json({
        status: "Failure",
        msg: "Link Expires"
      });
    }
    return
  }
  res.render("error");
}

async function emailVerified(req, res) {
  if (req.params) {
    let user_id = req.params.id;
    var user = await User.findOne({
      _id: user_id
    });
    if (user) {
      user.is_email_verified = true;
      new_user = await user.save();
      res.render("emailVerified", {
        user: ""
      });
      return
    }
    res.render("error");
  }
}

module.exports = {
  get,
  getProfilePicture,
  logout,
  post,
  bookARide,
  postBookARide,
  getMyBookedRides,
  unBookMyRide,
  setAlertOnSearch,
  forgetPassword,
  postForgetPassword,
  resetPassword,
  postResetPassword,
  emailVerified
};