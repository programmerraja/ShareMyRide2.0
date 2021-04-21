const express = require("express");
const signupController = require("../controllers/signupRider")
const {
  checkBodyRiderHandler
} = require("../middleware/checkBodyHandler");
const sanitizeHTML = require("../middleware/sanitizeHTML");


const router = express.Router();

// /signup/rider
router.get("/", signupController.get);

router.post("/", sanitizeHTML, checkBodyRiderHandler, signupController.post);




module.exports = router;