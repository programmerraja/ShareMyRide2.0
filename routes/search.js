const express = require("express");
const searchController = require("../controllers/search");
//middleware
const asyncHandler = require("../middleware/asyncHandler");
const sanitizeHTML = require("../middleware/sanitizeHTML");

const router = express.Router();

//routes staet with /search

router.post("/ride", sanitizeHTML, searchController.post);

router.get("/ride/id/:id", asyncHandler(searchController.getSpecificRide));

router.get("/get/booked/users/id/:id", asyncHandler(searchController.getBookedUsers));


module.exports = router;