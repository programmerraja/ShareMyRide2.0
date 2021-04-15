const express=require("express");
//conroller
const userController=require("../controllers/user");
//middleware
const {authUserHandler}=require("../middleware/authHandler");
const asyncHandler=require("../middleware/asyncHandler");
const {checkBodyUserHandler,checkBodyRideHandler}=require("../middleware/checkBodyHandler");
//util
const {generateToken,forgetPassword,AppError,verfiyMail,dbErrorHandler}=require("../util/util");


const router= express.Router();

//route for /user
router.get("/profile",authUserHandler,userController.get);
router.post("/profile",checkBodyUserHandler,authUserHandler,userController.post);

router.get("/book/ride/:id",authUserHandler,userController.bookARide);
router.post("/book/ride/",authUserHandler,userController.postBookARide);

router.post("/unbook/ride/",authUserHandler,userController.unBookMyRide);


router.get("/booked/rides/",authUserHandler,userController.getMyBookedRides);

// router.get("/unbook/myride/id/",authUserHandler,userController.removeMyRideForm);

router.get("/verifiy/email/:id",authUserHandler,asyncHandler(userController.emailVerified));

router.get("/reset/password/:id",authUserHandler,userController.resetPassword);
router.post("/reset/password/:id",authUserHandler,asyncHandler(userController.postResetPassword));

router.get("/forget/password/",authUserHandler,userController.forgetPassword);
router.post("/forget/password/",authUserHandler,asyncHandler(userController.postForgetPassword));

router.get("/logout",authUserHandler,userController.logout);

module.exports=router;