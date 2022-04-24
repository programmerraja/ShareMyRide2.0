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
router.get("/riders", adminAuthHandler, asyncHandler(adminController.getRiders));

router.get("/rider/id/:id", adminAuthHandler, asyncHandler(adminController.getRider));

router.post("/remove/ride/", adminAuthHandler, asyncHandler(adminController.removeRide));

router.post("/rider/remove/", adminAuthHandler, asyncHandler(adminController.removeRiderById));
router.post("/rider/verifiy/", adminAuthHandler, asyncHandler(adminController.verifiyRiderById));
router.post("/user/verifiy/", adminAuthHandler, asyncHandler(adminController.verifiyUserById));


router.get("/users", adminAuthHandler, asyncHandler(adminController.getUsers));
router.get("/user/id/:id", adminAuthHandler, asyncHandler(adminController.getUser));

router.post("/user/remove/", adminAuthHandler, asyncHandler(adminController.removeUserById));


module.exports = router;