const BottleEntry = require("../models/BottleEntry");
const MonthlySummary = require("../models/MonthlySummary");

exports.updateMonthlySummary = (month, year) => {
  return BottleEntry.find({ month, year }).then((entries) => {
    let total_bottles = 0;
    let total_amount = 0;

    entries.forEach((e) => {
      total_bottles += e.bottle_count;
      total_amount += e.amount;
    });

    const delivery_days = entries.length;

    return MonthlySummary.findOneAndUpdate(
      { month, year },
      {
        total_bottles,
        total_amount,
        delivery_days,
      },
      {
        new: true,
        upsert: true,
      },
    );
  });
};
