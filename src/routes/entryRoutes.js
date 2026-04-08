const express = require("express");
const router = express.Router();

const {
  addEntry,
  getMonthlyEntries,
  updateEntry,
  deleteEntry,
} = require("../controllers/entryController");

router.post("/add", addEntry);
router.get("/month", getMonthlyEntries);
router.put("/update/:id", updateEntry);
router.delete("/delete/:id", deleteEntry);

module.exports = router;
