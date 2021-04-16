const passport = require("passport");

//handling GET /signin/user
function getHandler(req, res) {
  if (!req.user) {
    res.render("signin", {
      link: "user"
    });
  } else {
    res.redirect("/user/booked/rides")
  }
}

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
          error_msg: info.message
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
        error_msg: "No User Exit"
      });
    }
  })(req, res, next);
}

module.exports = {
  getHandler,
  postHandler
};