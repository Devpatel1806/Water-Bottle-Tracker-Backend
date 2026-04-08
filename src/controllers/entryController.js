const BottleEntry = require("../models/BottleEntry");
const BottlePrice = require("../models/BottlePrice");
const { updateMonthlySummary } = require("../services/summaryService");

exports.addEntry = async (req, res, next) => {
  try {
    const { date, bottle_count } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    if (bottle_count === undefined) {
      return res.status(400).json({ message: "Bottle Count is required" });
    }

    if (!Number.isInteger(bottle_count)) {
      return res
        .status(400)
        .json({ message: "Bottle count must be whole number" });
    }

    if (bottle_count <= 0) {
      return res
        .status(400)
        .json({ message: "negative bottles are not allowed" });
    }

    const existing = await BottleEntry.findOne({ date });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Entry already exists for today" });
    }

    const priceData = await BottlePrice.findOne().sort({
      effective_from: -1,
    });

    const DEFAULT_PRICE = 5;
    const price = priceData?.price ?? DEFAULT_PRICE;

    const entryDate = new Date(date);
    const month = entryDate.getMonth() + 1;
    const year = entryDate.getFullYear();

    const amount = bottle_count * price;

    const newEntry = new BottleEntry({
      date,
      bottle_count,
      price_per_bottle: price,
      amount,
      month,
      year,
    });

    const saved = await newEntry.save();

    await updateMonthlySummary(month, year);

    return res.json({
      message: "Entry added",
      data: saved,
    });
  } catch (err) {
    return res.status(500).send("server error");
  }
};

exports.getMonthlyEntries = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const entries = await BottleEntry.find({
      month: Number(month),
      year: Number(year),
    }).sort({ date: 1 });

    let total_bottles = 0;
    let total_amount = 0;

    entries.forEach((e) => {
      total_bottles += e.bottle_count;
      total_amount += e.amount;
    });

    return res.json({
      entries,
      summary: {
        total_bottles,
        total_amount,
        delivery_days: entries.length,
      },
    });
  } catch (err) {
    return res.status(500).send("server error");
  }
};

exports.updateEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bottle_count } = req.body;

    if (!Number.isInteger(bottle_count)) {
      return res
        .status(400)
        .json({ message: "Bottle count must be whole number" });
    }

    const entry = await BottleEntry.findById(id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    const newAmount = bottle_count * entry.price_per_bottle;

    const updated = await BottleEntry.findByIdAndUpdate(
      id,
      {
        bottle_count,
        amount: newAmount,
      },
      { new: true },
    );

    await updateMonthlySummary(updated.month, updated.year);

    return res.json({
      message: "Entry updated",
      data: updated,
    });
  } catch (err) {
    return res.status(500).send("server error");
  }
};

exports.deleteEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const entry = await BottleEntry.findById(id);

    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    await BottleEntry.findByIdAndDelete(id);

    await updateMonthlySummary(entry.month, entry.year);

    return res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    return res.status(500).send("server error");
  }
};
