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

async function getRider(req, res) {
  let riders = await Rider.find({});
  res.json({
    status: "Sucess",
    riders: riders
  });
}


async function removeRiderById(req, res) {
  if (req.body.id) {
    let rider_id = req.body.id;
    let rider = await Rider.deleteOne({
      _id: rider_id
    });
    //remove ride also
    // let ride=await deleteMany({ rider_id: rider_id,});
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

async function getUser(req, res) {
  let users = await User.find({});
  res.json({
    status: "Sucess",
    users: users
  });
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
  getRider,
  removeRiderById,
  verifiyRiderById,
  getUser,
  removeUserById,
};