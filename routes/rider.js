const express=require("express");
//conroller
const riderController=require("../controllers/rider");
//middleware
const {authRiderHandler}=require("../middleware/authHandler");
const asyncHandler=require("../middleware/asyncHandler");
const {checkBodyRiderHandler,checkBodyRideHandler}=require("../middleware/checkBodyHandler");

//util
const {generateToken,forgetPassword,AppError,verfiyMail,dbErrorHandler}=require("../util/util");


const router= express.Router();

//route for /rider
router.get("/profile",authRiderHandler,riderController.get);
router.get("/profile/id/:id",riderController.getProfileById);
router.post("/profile",checkBodyRiderHandler,authRiderHandler,riderController.post);

router.get("/get/myrides/",authRiderHandler,riderController.getMyRides);

router.get("/get/myride/form",authRiderHandler,riderController.getMyRideForm);
router.post("/post/myride/form",checkBodyRideHandler,authRiderHandler,riderController.postMyRideForm);

router.get("/edit/myride/id/:id",authRiderHandler,riderController.editMyRideForm);
router.post("/edit/myride/id/:id",checkBodyRideHandler,authRiderHandler,riderController.postEditMyRideForm);
//if rider remove his ride we need to inform the user
router.post("/remove/myride/",authRiderHandler,riderController.removeMyRideForm);

router.get("/verifiy/email/:id",authRiderHandler,asyncHandler(riderController.emailVerified));

router.get("/reset/password/:id",authRiderHandler,riderController.resetPassword);
router.post("/reset/password/:id",authRiderHandler,asyncHandler(riderController.postResetPassword));

router.get("/forget/password/",authRiderHandler,riderController.forgetPassword);
router.post("/forget/password/",authRiderHandler,asyncHandler(riderController.postForgetPassword));

router.get("/logout",authRiderHandler,riderController.logout);

module.exports=router;