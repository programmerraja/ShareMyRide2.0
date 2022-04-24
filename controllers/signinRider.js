const passport = require("passport");

//handling GET /signin
function getHandler(req, res) {
  console.log(req.params)
  if (!req.user) {
    res.render("signin", {
      link: "rider",
      msg:req.query.msg
    });
  } else {
    res.redirect("/rider/get/myrides/")
  }
}

function postHandler(req, res, next) {
  res.rider_signin = true;
  passport.authenticate('local', function(err, rider, info) {
    if (err) {
      return next(err);
    }
    //allow only if he is rider
    if (info.rider) {
      if (!rider) {
        return res.render('signin', {
          link: "rider",
          msg: info.message
        });
      }

      //if rider sucessfully login we need to call manually the login function
      req.logIn(rider, function(err) {
        if (err) {
          return next(err);
        }
        return res.redirect('/rider/get/myrides');
      });
    } else {
      return res.render("signin", {
        link: "rider",
        msg: "No Rider Exit"
      })
    }
  })(req, res, next);
}


module.exports = {
  getHandler,
  postHandler
};