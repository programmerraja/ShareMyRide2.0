const express = require("express");
const searchController = require("../controllers/search");
//middleware
const asyncHandler = require("../middleware/asyncHandler");
const riderController = require("../controllers/rider");
const sanitizeHTML = require("../middleware/sanitizeHTML");

const router = express.Router();

//routes staet with /search

router.post("/ride", sanitizeHTML, searchController.post);

router.get("/ride/id/:id", asyncHandler(searchController.getSpecificRide));

router.get("/get/booked/users/id/:id", riderController.getBookedUsers);


module.exports = router;