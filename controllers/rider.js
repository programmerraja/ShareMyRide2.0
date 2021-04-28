//node modules
const mongoose = require("mongoose");
const Grid = require('gridfs-stream');
const bcrypt = require('bcrypt');
//models
const Ride = require("../models/Ride");
const Rider = require("../models/Rider");
const Alert = require("../models/Alert");

//util
const {
  generateToken,
  sendPasswordReset,
  sendAlertMail,
  AppError,
  dbErrorHandler,
  convertTimeToString,
  convertTimeToTime
} = require("../util/util");


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


//handling GET /signin
function get(req, res) {
  res.render("riderProfile", {
    rider: req.user
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

//handling GET /rider/logout
function logout(req, res) {
  req.session.destroy();
  res.redirect("/");
}

async function getProfileById(req, res) {
  if (req.params.id) {
    let id = req.params.id;
    let rider_profile = await Rider.findOne({
      _id: id
    });
    if (rider_profile) {
      res.render("riderProfileId", {
        rider_profile,
        rider: req.user
      });
      return;
    }

    //render 404
  }
}

async function post(req, res) {
  //need to check if rider realy change anything else dont update if rider change his mail
  //send the confirmation message
  if (res.locals.is_correct) {
    let {
      name,
      email,
      password,
      new_password,
      date_of_birth,
      gender,
      phoneno,
      whatsappno,
      licenseno,
      drivingexpereince,
      bio
    } = req.body;
    //don't remove this
    let old_password = password;

    let rider_id = req.user._id;

    let rider = await Rider.findOne({
      _id: rider_id
    });

    if (rider) {
      if (bcrypt.compareSync(old_password, rider.password)) {
        if (new_password) {
          new_password = bcrypt.hashSync(new_password, 2);
          rider.password = new_password;
        }
        rider.name = name;
        rider.email = email;
        rider.gender = gender;
        rider.date_of_birth = date_of_birth;
        rider.phoneno = phoneno;
        rider.whatsappno = whatsappno;
        rider.licenseno = licenseno;
        rider.drivingexpereince = drivingexpereince;
        rider.bio = bio;
        if (req.file) {
          rider.profile = req.file.filename;
        }
        rider = await rider.save().catch((err) => {
          let msg = dbErrorHandler(err)
          res.render("riderProfile", {
            rider: req.user,
            name: req.user.name,
            msg: msg
          });
        });
        if (rider) {
          res.render("riderProfile", {
            rider: rider,
            msg: "Sucessfully updated"
          });
        }

      } else {
        res.render("riderProfile", {
          rider: req.user,
          msg: "Password does not match"
        });
      }
    }
    return;
  }
  if (!req.body.password) {
    res.render("riderProfile", {
      rider: req.user,
      msg: "Please provide password to update your account"
    });
    return;
  }
  res.render("riderProfile", {
    rider: req.user,
    msg: "Please provide all data"
  });

}

async function getMyRides(req, res) {
  let rider_id = req.user._id;
  let rides = await Ride.find({
    rider_id: rider_id
  });
  if (rides) {
    res.render("myRides", {
      rider: req.user,
      rides
    });
    return
  }
  //render 404
  res.render("error");
}

function getMyRideFormTaxi(req, res) {
  res.render("myRideFormTaxi", {
    rider: req.user
  });
}

function getMyRideFormGoods(req, res) {
  res.render("myRideFormGoods", {
    rider: req.user
  });
}

function getMyRideOptions(req, res) {
  res.render("rideOptions", {
    rider: req.user
  });
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
          rider: req.user
        });
      
    }
  }
}
async function postMyRideForm(req, res) {
    if (res.locals.is_correct_ride) {
      let {
        from,
        to,
        type,
        model,
        passenger,
        amount,
        time,
        date
      } = req.body;
      let views = type === "taxi" ? "myRideFormTaxi" : "myRideFormGoods";

      from = from.toLowerCase();
      to = to.toLowerCase();
      let time_array = convertTimeToString(time);
      time = time_array[0] + ":" + time_array[1] + " " + time_array[2];
      let rider = req.user;
      let rider_id = rider._id;
      new_ride = new Ride({
        rider_id: rider_id,
        from,
        to,
        type,
        model,
        passenger,
        passenger_left: passenger,
        amount,
        time,
        date
      });
      new_ride.save().catch((err) => {
          let msg = dbErrorHandler(err);
          res.render(views, {
            msg: msg
          });
        });
        if (new_ride) {
          //if it sucessfully update the no of ride posted 
          let rider=await Rider.findOneAndUpdate({_id:req.user._id},{$inc:{ no_of_ride:1}});
          res.redirect("/rider/get/myrides/");
          //after sucessfully created check if it has alert
          type = type.toLowerCase();
          let alert = await Alert.find({
            from: from,
            to: to,
            date: {
              "$eq": date
            },
            type: type
          });
          let length = alert.length;
          if (length) {
            async function sentAlert(index) {
              //if we find alert get user id and get his email
              let user_id = alert[index].user_id;
              let user = await User.findOne({
                _id: user_id
              });
              if (user) {
                let email = user.email;
                let name = user.name;
                let link = req.protocol + "://" + req.get("host") + "/search/ride/id/" + new_ride._id;
                let alert_link = req.protocol + "://" + req.get("host") + "/user/unset/alert/" + alert[index]._id;
                //sending mail to user who set alert
                let msg = await sendAlertMail(email, name, alert[index], link, alert_link);
                //call recursively until empty
                index = index + 1;
                if (length > index) {
                  await sentAlert(index);
                }
              }
            }
            //passing first
            await sentAlert(0);
          }
        }
      }
      else {
        res.render(views, {
          msg: "Please provide all data"
        });
      }

    }
    async function editMyRideForm(req, res) {
      if (req.params.id) {
        //used rider id to avoid other rider to edit the ride
        let rider_id = req.user._id;
        let id = req.params.id;
        let ride = await Ride.findOne({
          rider_id: rider_id,
          _id: id
        });
        if (ride) {
          //depend on the type render the correspond form
          let views = ride.type === "taxi" ? "myRideFormTaxi" : "myRideFormGoods";
          //converting time format so we can set that as value
          ride.time = convertTimeToTime(ride.time);
          res.render(views, {
            rider: req.user,
            ride: ride
          });
          return
        }
      }
      // render the 404 page
      res.render("error");

    }

    async function postEditMyRideForm(req, res) {
      if (res.locals.is_correct_ride && req.params.id) {

        let id = req.params.id;
        let {
          from,
          to,
          type,
          model,
          passenger,
          amount,
          time,
          date
        } = req.body;
        //depend on the type render the correspond form
        let views = type === "taxi" ? "myRideFormTaxi" : "myRideFormGoods";
        let time_array = convertTimeToString(time);
        time = time_array[0] + ":" + time_array[1] + " " + time_array[2];

        let rider = req.user;
        let rider_id = rider._id;

        ride = await Ride.findOneAndUpdate({
          rider_id: rider_id,
          _id: id
        }, {
          rider_id: rider_id,
          from,
          to,
          type,
          model,
          passenger,
          passenger_left: passenger,
          amount,
          time,
          date
        });


        if (ride) {
          res.redirect("/rider/get/myrides/");
        }
      } else {
        res.render(views, {
          msg: "Please provide all data"
        });
      }

    }

    async function removeMyRideForm(req, res) {
      if (req.body.id) {
        let ride_id = req.body.id;
        let rider = req.user;
        let rider_id = rider._id;
        let ride = await Ride.deleteOne({
          _id: ride_id,
          rider_id: rider_id
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


    async function forgetPassword(req, res) {
      res.render("forgetPassword", {
        rider: req.user
      })

    }
    //handling POST /rider/forget/password
    async function postForgetPassword(req, res) {
      if (req.body.email) {
        let email = req.body.email;
        var rider = await Rider.findOne({
          email: email
        });
        if (rider) {
          let token = generateToken();
          let link = req.protocol + "://" + req.get("host") + "/rider/reset/password/" + token;

          //we adding 20 mins to current date and converting in to mili sec
          let password_reset_expires = Date.now() + 20 * 60 * 1000;
          //updating the rider token
          let new_rider = await Rider.findOneAndUpdate({
            _id: rider._id
          }, {
            password_reset_token: token,
            password_reset_expires: password_reset_expires
          });

          //sending mail to rider
          let msg = await sendPasswordReset(rider.email, rider.name, link);
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
          msg: "No rider exit with given gmail"
        })
        return
      }
      res.render("error");

    }

    //handling GET /rider/reset/password
    async function resetPassword(req, res) {
      res.render("resetPassword", {
        rider: req.user
      })
    }

    //handling POST /rider/reset/password
    async function postResetPassword(req, res) {

      if (req.params && req.body.password) {

        let password_reset_token = req.params.id;
        let new_password = req.body.password;
        //finding the rider
        var rider = await Rider.findOne({
          password_reset_token: password_reset_token,
          password_reset_expires: {
            $gt: Date.now()
          }
        });
        if (rider) {
          let hash = bcrypt.hashSync(new_password, 2);
          let new_rider = await Rider.findOneAndUpdate({
            _id: rider._id
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
        let rider_id = req.params.id;
        var rider = await Rider.findOne({
          _id: rider_id
        });
        if (rider) {
          rider.is_email_verified = true;
          new_rider = await rider.save();
          res.render("emailVerified", {
            rider: req.user
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
      getProfileById,
      post,
      getMyRideFormTaxi,
      getMyRideFormGoods,
      getMyRideOptions,
      getBookedUsers,
      editMyRideForm,
      postEditMyRideForm,
      postMyRideForm,
      removeMyRideForm,
      getMyRides,
      forgetPassword,
      postForgetPassword,
      resetPassword,
      postResetPassword,
      emailVerified
    };