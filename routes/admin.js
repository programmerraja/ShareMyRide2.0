//node modules
const express = require("express");
//controller
const adminController = require("../controllers/admin")
//middleware
const asyncHandler = require("../middleware/asyncHandler");
const adminAuthHandler = require("../middleware/adminAuthHandler");

//routes
const router = express.Router();

//routes for /admin/dashboard
router.get("/", adminAuthHandler, adminController.get);
router.get("/riders", adminAuthHandler, asyncHandler(adminController.getRider));

router.post("/rider/remove/", adminAuthHandler, asyncHandler(adminController.removeRiderById));
router.post("/rider/verifiy/", adminAuthHandler, asyncHandler(adminController.verifiyRiderById));

router.get("/users", adminAuthHandler, asyncHandler(adminController.getUser));
router.post("/user/remove/", adminAuthHandler, asyncHandler(adminController.removeUserById));


module.exports = router;