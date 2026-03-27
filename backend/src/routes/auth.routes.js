const express = require("express");

const asyncHandler = require("../middleware/asyncHandler");
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.post("/signup", asyncHandler(authController.signup));
router.post("/login", asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));
router.post("/logout", asyncHandler(authController.logout));

module.exports = router;

