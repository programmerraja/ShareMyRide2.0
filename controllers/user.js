
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
const Review = require("../models/Review");

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


/* 
    doing :
      render user profile picture
*/
function get(req, res) {
  res.render("userProfile", {
    user: req.user
  });
}

/* 
    No of DB Read: 1
    doing:
      send user profile img as stream
*/
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

/* 
    No of DB Read:1
    NO of DB Write:1
    doing:
      update the user profile data 
*/
async function post(req, res) {

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
        // user.email = email;
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
            msg: "success fully updated"
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

/* 
    No of DB Read:1
  render a book a ride page 
*/
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

/* 
  doing:
    1.post data id ,no of passenger,message and store data to booking collections 
    2.next send the mail to rider about booking 

  todo:
    1.rollback if anyone failed

  No of DB Read:4
  NO of DB Write:2

*/
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
    if (ride.status === "unavailable") {
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
          ride.status = "unavailable";
        }
        ride.passenger_left = seats;
      }
      //if user book truck simply update staus as booked
      else {
        ride.status = "unavailable";
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
          //increament the count
          let user = await User.findOneAndUpdate({
            _id: req.user._id
          }, {
            $inc: {
              rides_booked: 1
            }
          });
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
              status: "success",
              msg: "successfully booked"
            });
            return
          }
          // else{
          //  res.json({status:"Failure",msg:"Sorry For We Unable To Send Mail To Rider"});

          // }
        }
      }
      //if  ride failed we need to rollback   
    }
    //if no rider
    else {
      res.json({
        status: "Failure",
        msg: "Sorry Rider is not available"
      })
    }
  }
  //if user not provide data simply ignore it 
}

/* 
  DOING:
  1.post ride id and reason for ubook
  2.change the status of ride
  3.Delete the booking doc from the collections
  4.get rider detail and send the mail to him

  TODO:
    1.rollback if one failed

  No of DB Read:3
  NO of DB Write:1
  NO of DB Delete:1

*/

async function unBookMyRide(req, res) {
  if (req.body.id && req.body.reason) {
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
        //need to check if the passenger left == passenger then we need to put available
        if (passenger_left === ride.passenger) {
          ride.status = "available";
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
                passenger: passenger,
                reason: req.body.reason
              };
              //link for the ride 
              let link = req.protocol + "://" + req.get("host") + "/search/ride/id/" + ride._id;
              let msg = await sendUnBookRideMail(to_mail, rider.name, user_data, link);
              if (msg) {
                res.json({
                  "status": "success",
                  msg: "successfully Unbooked"
                });
                return;
              }
              //this send the response and also the errorhandler also 
              //send res it cause error
              // else{
              //  //if failed we need to rollback
              //                res.json({status:"Failure",msg:"Sorry For We Unable To Send Mail To Rider"});
              //            }
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

/* 
  DOING:
  1.getting all booked rides for user
  2.find all booking doc belong to the user
  3.iterate through each booking and store the ride id and no of passenger user booked
  4.iterate through ride id that stored in array and get the ride detail and store it on the rides array 
  5.while iterating over the passenger with user booked passenger
  6.render the booked rides

   No of DB Read: 1 and more depend on le
*/

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
  //to get the ride detail
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
  res.render("bookedRides", {
    user: req.user,
    rides
  });
  return


}

/* 
  DOING:
  1.post rating review rider id 
  2.first check if user is not already rate the rider
  3.if not create new doc on review collection 
  4.get rider detail and update his rating and total rating

  No of DB Read:3
  NO of DB Write:1

*/
async function postReview(req, res) {
  //if recevied order change it cause problem
  let {
    ratings,
    review,
    rider_id
  } = req.body;
  if (ratings && review && rider_id) {
    ratings = parseInt(ratings);
    let old_review = await Review.findOne({
      "user_id": req.user._id,
      "rider_id": rider_id
    });
    //if he already not post the review
    if (!old_review) {

      let new_review = new Review({
        "user_id": req.user._id,
        "rider_id": rider_id,
        "rating": ratings,
        "review": review
      });

      let rider = await Rider.findOne({
        _id: rider_id
      });

      let current_rating = rider.rating * rider.total_rating;
      ratings = (current_rating + ratings) / (rider.total_rating + 1)
      ratings = ratings.toFixed(1);
      total_rating = rider.total_rating + 1;

      rider = await Rider.findOneAndUpdate({
        _id: rider_id
      }, {
        total_rating: total_rating,
        rating: ratings
      })

      new_review = await new_review.save().catch((err) => {
        let msg = dbErrorHandler(err);
        res.json({
          status: "Failure",
          msg: msg
        });
      });
      res.json({
        status: "success",
        msg: "successfully Added"
      })
    } else {
      res.json({
        status: "Failure",
        msg: "Already Reviewed"
      })

    }

  }
}

/* 
  DOING:
  1.post from ,to ,date ,user id ,vechile type
  2.create new doc on ride collection with given detail

  TODO:
    1.if some detail missing while posting inform the user
  No of DB Read:
  NO of DB Write:1

*/
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
        "status": "success",
        "msg": "Alert Created successfully"
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

/* 
  DOING:
  1.based on alert id we delete the alert document

  No of DB Delte:1

*/
async function unSetAlertOnSearch(req, res) {
  if (req.params.id) {
    let id = req.params.id;
    let alert = await Alert.deleteOne({
      _id: id
    });
    if (alert) {
      res.json({
        status: "successfully Unalerted"
      });
    } else {
      res.json({
        status: "Something went wrong"
      });

    }
    return;
  }
  res.render("error");
}

/* 
  DOING:
  1.getting user id and find the user detail 
  2.update the email verified as true 

  No of DB Read:1
  NO of DB Write:1

*/
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
  }
  res.render("error");

}

/* 
  DOING:
  1.simply renderinng the page
*/
function resetPassword(req, res) {
  res.render("resetPassword");
}

/* 
  DOING:
  1.post new password
  2.find the user based on password_reset_token and check if link expires
  3.create hash for the new password and update it 
  No of DB Read:2

*/
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
        status: "success",
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

/* 
  DOING:
  1.simply rendering the page

*/
function forgetPassword(req, res) {
  res.render("forgetPassword");
}

/* 
  DOING:
  1.post user email
  2.if email find generate the token store that in user doc and send to the user mail
  3.if mail send success else failed 

  No of DB Read:1
  NO of DB Write:1

*/
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
          status: "success",
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
    });
    return
  }
  res.render("error");
}

/* 
  DOING:
  1. destroy the session and redirect to home page

  NO Of Delte: 1
*/
function logout(req, res) {
  req.session.destroy();
  res.redirect("/");
}

module.exports = {
  get,
  getProfilePicture,
  post,
  bookARide,
  postReview,
  postBookARide,
  getMyBookedRides,
  unBookMyRide,
  setAlertOnSearch,
  forgetPassword,
  postForgetPassword,
  resetPassword,
  postResetPassword,
  emailVerified,
  logout
};