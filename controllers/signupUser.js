const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
var validator = require('validator');
const User = require("../models/User");
const Rider = require("../models/Rider");

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

function getHandler(req, res) {
  if (!req.user) {
    res.render("signupUser");
  } else {
    res.redirect("/user/booked/rides/")
  }
}

//handling POST /signup/user
async function postHandler(req, res) {
  // console.log(req.body,"ss")
  // return;
  if (!validator.isEmail(req.body.email)) {
    res.render("signupUser", {
      msg: "Invalid Email"
    });
    return
  }
  if (String(req.body.whatsappno).length != 10) {
    res.render("signupUser", {
      msg: "Invalid Whatsapp Number"
    });
    return
  }
  //need to check if the new user is not rider
  let rider = await Rider.findOne({
    email: req.body.email
  });
  if (!rider) {
    //default profile picture
    let profile = "ee308e7b085f9eb21908e7461e51fab0.png";
    //if user upload profile picture 
    if (req.file) {
      profile = req.file.filename;
    }
    let hash = bcrypt.hashSync(req.body.password, salt_rounds);
    req.body.password = hash;
    let new_user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      whatsappno: req.body.whatsappno,
      adharNo:req.body.adharNo,
      profile: profile,
      isEmailVerified:true
    });

    new_user = await new_user.save().catch((err) => {
      let msg = dbErrorHandler(err);
      res.render("signupUser", {
        msg: msg
      });
    });
    if (new_user) {
      let link = req.protocol + "://" + req.get("host") + "/user/verifiy/email/" + new_user._id;
      let msg =true // await verfiyMail(new_user.email, new_user.name, link);
      if (msg) {
        res.redirect("/signin/user?msg=Account%20created%20successfully");
      } else {
        //need to remove user from database if mail not send successfully
        await User.deleteOne({
          _id: new_user._id
        }).catch((err) => {
          let msg = dbErrorHandler(err)
          res.render("signupUser", {
            msg: msg
          });
        });
        res.render("signupUser", {
          msg: "Sorry Something went wrong. Please try again"
        });
      }
    }
  }
  //if he is user
  else {
    res.render("signupUser", {
      msg: "Sorry Your Email Exit in Rider account try different email"
    });
  }
}





module.exports = {
  getHandler,
  postHandler
};