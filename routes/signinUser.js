const express = require("express");

const signinUserController = require("../controllers/signinUser");
const sanitizeHTML = require("../middleware/sanitizeHTML");

const router = express.Router();

// signin/rider
router.get("/", signinUserController.getHandler);

router.post("/", sanitizeHTML, signinUserController.postHandler);


module.exports = router;