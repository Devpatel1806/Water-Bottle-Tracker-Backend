const express = require("express");
const router = express.Router();

const { getMonthlySummary } = require("../controllers/summaryController");

router.get("/", getMonthlySummary);

module.exports = router;
