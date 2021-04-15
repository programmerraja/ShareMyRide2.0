const express=require("express");
const searchController=require("../controllers/search");
//middleware
const asyncHandler=require("../middleware/asyncHandler");
const router= express.Router();

//routes staet with /search

router.post("/ride",searchController.post);

router.get("/ride/id/:id",asyncHandler(searchController.getSpecificRide));




module.exports=router;