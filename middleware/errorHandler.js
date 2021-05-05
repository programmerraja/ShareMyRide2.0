const {
  dbErrorHandler
} = require("../util/util");

function errorHandler(err, req, res, next) {
  //if not status code set it at internal server problem
  if (!err.status_code) {
    err.status_code = 500;
  }
  if (process.env.NODE_ENV === "PRODUCTION") {
    let error_msg = dbErrorHandler(err);
    console.log(error_msg,'ssssss')
    res.status(err.status_code).json({
      status: "Failed",
      msg: error_msg
    });
    return;
  } else {
    
    res.status(err.status_code).json({
      "msg": err.message,
      error: err
    });
  }
}
module.exports = errorHandler;