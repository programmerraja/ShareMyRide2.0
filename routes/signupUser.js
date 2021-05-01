const express = require("express");
//controller
const signupUserController = require("../controllers/signupUser");
//middleware
const sanitizeHTML = require("../middleware/sanitizeHTML");
//utill
const {
  upload
} = require("../util/util");

const router = express.Router();


// signin/user
router.get("/", signupUserController.getHandler);

router.post("/", upload.single("profile"), sanitizeHTML, signupUserController.postHandler);

module.exports = router;