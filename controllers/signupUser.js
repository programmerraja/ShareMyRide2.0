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

  if (!validator.isEmail(req.body.email)) {
    res.render("signupUser", {
      msg: "Invalid Email"
    });
    return
  }
  //need to check if the  new user is not rider
  let rider = await Rider.findOne({
    email: req.body.email
  });
  if (!rider) {
    let hash = bcrypt.hashSync(req.body.password, salt_rounds);
    req.body.password = hash;
    let new_user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      whatsappno: req.body.whatsappno
    });

    new_user = await new_user.save().catch((err) => {
      let msg = dbErrorHandler(err);
      res.render("signupUser", {
        msg: msg
      });
    });
    if (new_user) {
      let link = req.protocol + "://" + req.get("host") + "/user/verifiy/email/" + new_user._id;
      let msg = await verfiyMail(new_user.email, new_user.name, link);
      if (msg) {
        res.redirect("/signin/user");
      } else {
        //need to remove user from database  if mail not send sucessfully
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