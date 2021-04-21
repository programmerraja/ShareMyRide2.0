const express = require("express");
const signinRiderController = require("../controllers/signinRider");
const sanitizeHTML = require("../middleware/sanitizeHTML");

const router = express.Router();

// signin/rider
router.get("/", signinRiderController.getHandler);

router.post("/", sanitizeHTML, signinRiderController.postHandler);


module.exports = router;