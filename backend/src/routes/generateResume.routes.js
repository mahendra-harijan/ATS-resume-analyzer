const express = require("express");

const { generateResume } = require("../controllers/generateResume.controller");

const router = express.Router();

router.post("/", generateResume);

module.exports = router;
