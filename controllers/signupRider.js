const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
var validator = require('validator');
const Rider = require("../models/Rider");
const User = require("../models/User");

//util
const {
  generateToken,
  forgetPassword,
  AppError,
  verfiyMail,
  dbErrorHandler
} = require("../util/util");

const salt_rounds = 5;
//handling GET /Signup

function get(req, res) {
  if (!req.user) {
    res.render("signupRider");
  } else {
    res.redirect("/rider/get/myrides/")
  }
}

//handling POST /signup/rider
async function post(req, res) {
  if (!validator.isEmail(req.body.email)) {
    res.render("signupRider", {
      error_msg: "Invalid Email"
    });
    return
  }
  //need to check if the  new rider is not user
  let user = await User.findOne({
    email: req.body.email
  });
  if (!user) {
    let hash = bcrypt.hashSync(req.body.password, salt_rounds);
    req.body.password = hash;
    let new_rider = new Rider({
      name: req.body.name,
      gender: req.body.gender,
      email: req.body.email,
      password: req.body.password,
      date_of_birth: req.body.date_of_birth,
      phoneno: req.body.phoneno,
      whatsappno: req.body.whatsappno,
      drivingexpereince: req.body.drivingexpereince,
      licenseno: req.body.licenseno,
      bio: req.body.bio
    });

    new_rider = await new_rider.save().catch((err) => {
      let error_msg = dbErrorHandler(err);
      res.render("signup", {
        error_msg: error_msg
      });
    });
    if (new_rider) {
      let link = req.protocol + "://" + req.get("host") + "/rider/verifiy/email/" + new_rider._id;
      let msg = await verfiyMail(new_rider.email, new_rider.name, link);
      if (msg) {
        res.redirect("/signin/rider");
      } else {
        //need to remove rider from database  if mail not send sucessfully
        await Rider.deleteOne({
          _id: new_rider._id
        }).catch((err) => {
          let error_msg = dbErrorHandler(err)
          res.render("signupRider", {
            error_msg: error_msg
          });
        });
        res.render("signupRider", {
          error_msg: "Sorry Something went wrong. Please try again"
        });
      }
    }
  }
  //if he is user
  else {
    res.render("signupRider", {
      error_msg: "Sorry Your Email Exit in user account try different email"
    });

  }
}





module.exports = {
  get,
  post
};