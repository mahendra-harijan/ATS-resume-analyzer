const express = require("express");
const multer = require("multer");

const asyncHandler = require("../middleware/asyncHandler");
const requireAuth = require("../middleware/requireAuth");
const analysisController = require("../controllers/analysis.controller");
const env = require("../config/env");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: env.FILE_MAX_BYTES },
});

router.post("/analyze", requireAuth, upload.single("resume"), asyncHandler(analysisController.analyze));
router.get("/history", requireAuth, asyncHandler(analysisController.history));
router.get("/report/:reportId", requireAuth, asyncHandler(analysisController.getReport));
router.delete("/report/:reportId", requireAuth, asyncHandler(analysisController.deleteReport));

module.exports = router;

