const MonthlySummary = require("../models/MonthlySummary");

exports.getMonthlySummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const summary = await MonthlySummary.findOne({
      month: Number(month),
      year: Number(year),
    });

    if (!summary) {
      return res.json({
        total_bottles: 0,
        total_amount: 0,
        delivery_days: 0,
      });
    }

    res.json(summary);
  } catch (err) {
    res.status(500).send("server error");
  }
};
