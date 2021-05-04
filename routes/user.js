
const express = require("express");
const mongoose = require("mongoose");
const Grid = require('gridfs-stream');

//conroller
const userController = require("../controllers/user");

//middleware
const {
  authUserHandler
} = require("../middleware/authHandler");
const asyncHandler = require("../middleware/asyncHandler");
const {
  checkBodyUserHandler,
  checkBodyRideHandler
} = require("../middleware/checkBodyHandler");
const {
  checkMailVerified
} = require("../middleware/checkMailVerified");
const sanitizeHTML = require("../middleware/sanitizeHTML");

//utill
const {
  generateToken,
  forgetPassword,
  AppError,
  verfiyMail,
  dbErrorHandler,upload
} = require("../util/util");

const router = express.Router();

//route for /user

router.get("/profile", authUserHandler, userController.get);
router.get("/profile/:name", userController.getProfilePicture);
router.post("/profile", authUserHandler, upload.single("profile"), sanitizeHTML, checkBodyUserHandler, asyncHandler(userController.post));

router.get("/book/ride/:id", authUserHandler, asyncHandler(userController.bookARide));
router.post("/book/ride/", authUserHandler, checkMailVerified, sanitizeHTML, asyncHandler(userController.postBookARide));

router.post("/unbook/ride/", authUserHandler, sanitizeHTML, asyncHandler(userController.unBookMyRide));
router.get("/booked/rides/", authUserHandler, asyncHandler(userController.getMyBookedRides));

router.post("/post/review/", authUserHandler, checkMailVerified, sanitizeHTML, asyncHandler(userController.postReview));

router.get("/unset/alert/:id",authUserHandler, asyncHandler(userController.unSetAlertOnSearch));
router.post("/set/alert/", sanitizeHTML, authUserHandler, asyncHandler(userController.setAlertOnSearch));

router.get("/verifiy/email/:id", asyncHandler(userController.emailVerified));

router.get("/reset/password/:id", userController.resetPassword);
router.post("/reset/password/:id", sanitizeHTML, asyncHandler(userController.postResetPassword));

router.get("/forget/password/", userController.forgetPassword);
router.post("/forget/password/", sanitizeHTML, asyncHandler(userController.postForgetPassword));

router.get("/logout", authUserHandler, userController.logout);

module.exports = router;