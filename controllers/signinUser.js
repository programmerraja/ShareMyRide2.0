const passport = require("passport");

/* 
  DOING:
  1. simply rendering
*/
function getHandler(req, res) {
  if (!req.user) {
    res.render("signin", {
      link: "user",
      msg:req.query.msg
    });
  } else {
    res.redirect("/user/booked/rides")
  }
}

/* 
  DOING:
  1. passing info.user if he is user else not
  
*/
function postHandler(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    //allow only he is user
    if (info.user) {
      if (!user) {
        return res.render('signin', {
          link: "user",
          msg: info.message
        });
      }
      //if user sucessfully login we need to call manually the login function
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/user/booked/rides");
      });
    } else {
      return res.render("signin", {
        link: "user",
        msg: "No User Exit"
      });
    }
  })(req, res, next);
}

module.exports = {
  getHandler,
  postHandler
};