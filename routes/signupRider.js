const express=require("express");
const signupController=require("../controllers/signupRider")
const {checkBodyRiderHandler}=require("../middleware/checkBodyHandler");


const router= express.Router();

// /signup/rider
router.get("/",signupController.get);

router.post("/",checkBodyRiderHandler,signupController.post);




module.exports=router;