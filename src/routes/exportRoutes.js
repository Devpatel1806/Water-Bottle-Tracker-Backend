const express = require("express");
const router = express.Router();

const { exportMonthlyReport } = require("../controllers/exportController");

router.get("/monthly", exportMonthlyReport);

module.exports = router;
