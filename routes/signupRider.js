const express = require("express");
//conteoller
const signupController = require("../controllers/signupRider")
//middleware
const {checkBodyRiderHandler} = require("../middleware/checkBodyHandler");
const sanitizeHTML = require("../middleware/sanitizeHTML");
//util
const {upload} = require("../util/util");

const router = express.Router();

// /signup/rider
router.get("/", signupController.get);

router.post("/", upload.single("profile"), sanitizeHTML, checkBodyRiderHandler, signupController.post);




module.exports = router;