//node modules
const mongoose = require("mongoose");
const Grid = require('gridfs-stream');
const bcrypt = require('bcrypt');
//models
const Ride = require("../models/Ride");
const Rider = require("../models/Rider");
const Alert = require("../models/Alert");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Review = require("../models/Review");
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


/* 
  DOING:
  1.render the rider profile page 
*/

function get(req, res) {
  res.render("riderProfile", {
    rider: req.user
  });
}

/* 
  DOING:
  1.return the rider profile img based on the name

  TODO:
    1.remove the rider picture if he changed it 

  
  No of DB Read:1
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
  DOING:
  1.get id and return the rider detail 

  
  No of DB Read:1
*/
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
  }
  res.render("error");
}

/* 
  DOING:
  1.post rider name,email,password,new password...
  2.based on user given date change it on the rider doc 

  
  No of DB Read:1
  NO of DB Write:1
*/
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
        // rider.email = email;
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

/* 
  DOING:
  1.get all ride based on rider id and render it
  
  No of DB Read:1
*/
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
  res.render("error");
}

/* 
  DOING:
  1.based ride id getting ride details (to find no of unbooked seats)
  2.getting booking detail based on ride id
  3.iterating booking doc to get the use id and no of passenger user booked and store it on the array 
  4.iterating user id array to getting user detail and store that in array and adding passenger count to user doc
  5.using ride doc finding no of seats are unbooked
  6. rendering all detail

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
      rider: req.user
    });

  }
}

/* 
  DOING:
  1. simply rendering
  
*/
function getMyRideOptions(req, res) {
  res.render("rideOptions", {
    rider: req.user
  });
}

/* 
  DOING:
  1. simply rendering
  
*/
function getMyRideFormTaxi(req, res) {
  res.render("myRideFormTaxi", {
    rider: req.user
  });
}

/* 
  DOING:
  1. simply rendering
  
*/
function getMyRideFormGoods(req, res) {
  res.render("myRideFormGoods", {
    rider: req.user
  });
}

/* 
  DOING:
  1.post from ,to... data 
  2.converting from to to lowercase and convert time to string
  3.create new ride 
  4.update the rider doc by increamenting tota ride posted by one 
  5.redirect the rider to myride
  6.next check if it has alert if has get user doc by using user id and iterate all the user to  send mail to him

  TODO:
    1.seperate the functionallity of send alert 
  
  No of DB Read:2 and more depend on alert length
  NO of DB Write:2
*/
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
      let rider = await Rider.findOneAndUpdate({
        _id: req.user._id
      }, {
        $inc: {
          no_of_ride: 1
        }
      });
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
  } else {
    res.render(views, {
      msg: "Please provide all data"
    });
  }
}

/* 
  DOING:
  1.get ride id find the type and render the correspoding page

  TODO:
    1.reduce db reading by puting type in the url 
  
  No of DB Read:1
*/
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

/* 
  DOING:
  1.post from ,to ....
  2.update the new data 
  3.find the type and render the coresspond page if it has error
  4.redirect to myrides

  TODO:
    1.inform the booked user that change has happen
  
  NO of DB Write:1
*/
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

/* 
  DOING:
  1.get rider id find review and rider doc for getting rating and total rating
  2.iterate through the review and get the user doc based on user id add user name and profile picture to review doc
  3.if he is user render corresponding page and vice versa for rider

  
  No of DB Read:2 and based on review length
*/
async function getReviews(req, res) {
  if (req.params.id) {
    let reviews = await Review.find({
      rider_id: req.params.id
    });
    let length = reviews.length;
    let rider = await Rider.findOne({
      _id: req.params.id
    });
    let rating = rider.rating;
    let total_rating = rider.total_rating;
    let ratings = {
      rating,
      total_rating
    };
    async function getUsers(index) {
      let user = await User.findOne({
        _id: reviews[index].user_id
      });
      // console.log(user)
      if (user) {
        reviews[index]._doc.user_name = user.name;
        reviews[index]._doc.profile = "/user/profile/" + user.profile;
      }
      index += 1;
      if (index < length) {
        getUsers(index);
      }
    }
    if (length > 0) {
      await getUsers(0);
    }
    if (req.user) {
      if (req.user.licenseno) {
        res.render("reviewRating", {
          rider: req.user,
          rider_id: req.params.id,
          reviews: reviews,
          ratings: ratings
        })
      } else {
        res.render("reviewRating", {
          user: req.user,
          rider_id: req.params.id,
          reviews: reviews,
          ratings: {
            rating,
            total_rating
          }
        })
      }
    } else {
      res.render("reviewRating", {
        rider_id: req.params.id,
        reviews: reviews,
        ratings: {
          rating,
          total_rating
        }
      })

    }
    return;
  }
  res.render("error");
}

/* 
  DOING:
  1.post rider id  remove ride doc based on id and rider id
  2.And delte corresponding booking doc for that ride

  TODO:
    1.infrom the user who booked if rider remove before travel and ask for the reason to cancel the ride 
  
  NO of DB Delete:2
*/
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

/* 
  DOING:
  1. simply rendering
*/
async function forgetPassword(req, res) {
  res.render("forgetPassword", {
    rider: req.user
  })
}

/* 
  DOING:
  1.post rider email
  2.if email find generate the token store that in rider doc and send to the rider mail
  3.if mail send sucess else failed 

  
  No of DB Read:1
  NO of DB Write:1
*/
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

/* 
  DOING:
  1. simply rendering
*/
async function resetPassword(req, res) {
  res.render("resetPassword", {
    rider: req.user
  })
}

/* 
  DOING:
  1.post new password
  2.find the rider based on password_reset_token and check if link expires
  3.create hash for the new password and update it 
  
  No of DB Read:1
  NO of DB Write:1
*/
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

/* 
  DOING:
  1.getting user id and find the user detail 
  2.update the email verified as true 
  
  TODO:
    1. use find one and update

  No of DB Read:1
  NO of DB Write:1

*/
async function emailVerified(req, res) {
  if (req.params) {
    let rider_id = req.params.id;
    var rider = await Rider.findOneAndUpdate({
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

/* 
  DOING:
  1. destroy the session and redirect to home page
  
  NO of DB Delete:1
*/
function logout(req, res) {
  req.session.destroy();
  res.redirect("/");
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
  getReviews,
  forgetPassword,
  postForgetPassword,
  resetPassword,
  postResetPassword,
  emailVerified
};