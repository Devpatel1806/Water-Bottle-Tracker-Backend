const mongoose = require("mongoose");

const bottleEntrySchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true,
    },
    bottle_count: {
      type: Number,
      required: true,
    },
    price_per_bottle: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: Number,
    year: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model("BottleEntry", bottleEntrySchema);
