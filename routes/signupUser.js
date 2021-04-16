const express = require("express");
const signupUserController = require("../controllers/signupUser");

const router = express.Router();

// signin/user
router.get("/", signupUserController.getHandler);

router.post("/", signupUserController.postHandler);


module.exports = router;