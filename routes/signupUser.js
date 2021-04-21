const express = require("express");
const signupUserController = require("../controllers/signupUser");
const sanitizeHTML = require("../middleware/sanitizeHTML");

const router = express.Router();

// signin/user
router.get("/", signupUserController.getHandler);

router.post("/", sanitizeHTML, signupUserController.postHandler);


module.exports = router;