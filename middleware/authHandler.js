const {
  AppError
} = require("../util/util");

function authUserHandler(req, res, next) {
  //he must be user but not a rider
  if (req.user && !req.user.licenseno) {
    next()
    return
  }
  res.redirect("/signin/user/");
}

function authRiderHandler(req, res, next) {
  console.log(req.user,"ssssss")
  if (req.user) {
    if (req.user.licenseno) {
      next()
      return
    }
  }
  res.redirect("/signin/rider/");
}

module.exports = {
  authUserHandler,
  authRiderHandler
};