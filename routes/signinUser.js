const express=require("express");
const signinUserController=require("../controllers/signinUser");

const router= express.Router();

// signin/rider
router.get("/",signinUserController.getHandler);

router.post("/",signinUserController.postHandler);


module.exports=router;