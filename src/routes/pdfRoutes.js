const express = require("express");
const router = express.Router();
const { generateMonthlyPDF } = require("../controllers/pdfController");

// GET /api/pdf/monthly?month=&year=
router.get("/monthly", generateMonthlyPDF);

module.exports = router;
