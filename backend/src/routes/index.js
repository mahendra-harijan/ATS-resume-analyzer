const express = require("express");

const requireDb = require("../middleware/requireDb");
const authRoutes = require("./auth.routes");
const analysisRoutes = require("./analysis.routes");
const generateResumeRoutes = require("./generateResume.routes");

const router = express.Router();

// Public / non-DB routes
router.use("/generate-resume", generateResumeRoutes);

// All current API routes depend on MongoDB.
router.use(requireDb);

router.use("/auth", authRoutes);
router.use("/analysis", analysisRoutes);

module.exports = router;

