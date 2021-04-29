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
      msg: "Invalid Email"
    });
    return
  }
  if (String(req.body.phoneno).length!=10 ) {
    res.render("signupRider", {
      msg: "Invalid Phone Number"
    });
    return
  }
  if (String(req.body.whatsappno).length!=10 ) {
    res.render("signupRider", {
      msg: "Invalid Whatsapp Number"
    });
    return
  }
  //need to check if the new rider is not user
  let user = await User.findOne({
    email: req.body.email
  });
  if (!user) {
    let profile="profile/abaee7de02f3af19f65d6548a67b27f3.png";
    //if user upload profile picture 
    if(req.file){
       profile = req.file.filename;
    }
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
      bio: req.body.bio,
    });

    new_rider = await new_rider.save().catch((err) => {
      let msg = dbErrorHandler(err);
      res.render("signupRider", {
        msg: msg
      });
    });
    if (new_rider) {
      let link = req.protocol + "://" + req.get("host") + "/rider/verifiy/email/" + new_rider._id;
      let msg = await verfiyMail(new_rider.email, new_rider.name, link);
      if (msg) {
        res.redirect("/signin/rider");
      } else {
        //need to remove rider from database if mail not send sucessfully
        await Rider.deleteOne({
          _id: new_rider._id
        }).catch((err) => {
          let msg = dbErrorHandler(err)
          res.render("signupRider", {
            msg: msg
          });
        });
        res.render("signupRider", {
          msg: "Sorry Something went wrong. Please try again"
        });
      }
    }
  }
  //if he is user
  else {
    res.render("signupRider", {
      msg: "Sorry Your Email Exit in user account try different email"
    });

  }
}





module.exports = {
  get,
  post
};