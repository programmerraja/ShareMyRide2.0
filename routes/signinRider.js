const express = require("express");
const signinRiderController = require("../controllers/signinRider");

const router = express.Router();

// signin/rider
router.get("/", signinRiderController.getHandler);

router.post("/", signinRiderController.postHandler);


module.exports = router;