const express = require("express");
//conroller
const riderController = require("../controllers/rider");
//middleware
const {
  authRiderHandler
} = require("../middleware/authHandler");
const asyncHandler = require("../middleware/asyncHandler");
const checkMailVerified = require("../middleware/checkMailVerified");
const sanitizeHTML = require("../middleware/sanitizeHTML");

const {
  checkBodyRiderHandler,
  checkBodyRideHandler,
} = require("../middleware/checkBodyHandler");

//util
const {
  generateToken,
  forgetPassword,
  AppError,
  verfiyMail,
  dbErrorHandler
} = require("../util/util");


const router = express.Router();

//route for /rider
router.get("/profile", authRiderHandler, riderController.get);
router.get("/profile/id/:id", riderController.getProfileById);

router.post("/profile", sanitizeHTML, checkBodyRiderHandler, authRiderHandler, riderController.post);

router.get("/get/myrides/", authRiderHandler, riderController.getMyRides);

router.get("/get/booked/users/id/:id", authRiderHandler, riderController.getBookedUsers);

router.get("/get/ride/options", authRiderHandler, riderController.getMyRideOptions);

router.get("/get/ride/taxi", authRiderHandler, riderController.getMyRideFormTaxi);
router.post("/post/ride/taxi", sanitizeHTML, checkMailVerified, authRiderHandler, checkBodyRideHandler, riderController.postMyRideForm);

router.get("/get/ride/goods&services", authRiderHandler, riderController.getMyRideFormGoods);
router.post("/post/ride/goods&services", sanitizeHTML, checkMailVerified, authRiderHandler, checkBodyRideHandler, riderController.postMyRideForm);

router.get("/edit/ride/taxi/id/:id", authRiderHandler, riderController.editMyRideForm);
router.post("/edit/ride/taxi/id/:id", sanitizeHTML, checkMailVerified, checkBodyRideHandler, authRiderHandler, riderController.postEditMyRideForm);

router.get("/edit/ride/goods&services/id/:id", authRiderHandler, riderController.editMyRideForm);
router.post("/edit/ride/goods&services/id/:id", sanitizeHTML, checkMailVerified, checkBodyRideHandler, authRiderHandler, riderController.postEditMyRideForm);

//if rider remove his ride we need to inform the user
router.post("/remove/myride/", authRiderHandler, riderController.removeMyRideForm);

router.get("/verifiy/email/:id", asyncHandler(riderController.emailVerified));

router.get("/reset/password/:id", riderController.resetPassword);
router.post("/reset/password/:id", sanitizeHTML, asyncHandler(riderController.postResetPassword));

router.get("/forget/password/", riderController.forgetPassword);
router.post("/forget/password/", sanitizeHTML, asyncHandler(riderController.postForgetPassword));

router.get("/logout", authRiderHandler, riderController.logout);

module.exports = router;