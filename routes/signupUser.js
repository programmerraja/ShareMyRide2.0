const express = require("express");
const signupUserController = require("../controllers/signupUser");
const sanitizeHTML = require("../middleware/sanitizeHTML");

const router = express.Router();
const {
  upload
} = require("../util/util");


// signin/user
router.get("/", signupUserController.getHandler);

router.post("/", upload.single("profile"), sanitizeHTML, signupUserController.postHandler);

module.exports = router;