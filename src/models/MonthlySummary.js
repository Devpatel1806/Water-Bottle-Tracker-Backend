const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema(
  {
    month: Number,
    year: Number,
    total_bottles: Number,
    delivery_days: Number,
    total_amount: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("MonthlySummary", summarySchema);
