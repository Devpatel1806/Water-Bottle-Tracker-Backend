const ExcelJS = require("exceljs");
const BottleEntry = require("../models/BottleEntry");
const MonthlySummary = require("../models/MonthlySummary");

exports.exportMonthlyReport = async (req, res, next) => {
  try {
    const { month, year, type } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const m = Number(month);
    const y = Number(year);

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 1);

    const summary = await MonthlySummary.findOne({
      month: m,
      year: y,
    });

    let entries = await BottleEntry.find({
      date: { $gte: startDate, $lt: endDate },
    }).sort({ date: 1 });

    if (!Array.isArray(entries)) entries = [];
    entries = entries.filter((e) => e);

    const summaryData = summary || {
      total_bottles: 0,
      delivery_days: 0,
      total_amount: 0,
    };

    if (type === "json") {
      return res.json({
        month: m,
        year: y,
        summary: summaryData,
        entries: entries.map((e) => ({
          date: new Date(e.date).toISOString().split("T")[0],
          bottle_count: e.bottle_count || 0,
          price_per_bottle: e.price_per_bottle || 0,
          amount: e.amount || 0,
        })),
      });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Monthly Report");

    sheet.mergeCells("A1", "D1");
    sheet.getCell("A1").value = `Monthly Report: ${month}-${year}`;
    sheet.getCell("A1").font = { bold: true, size: 14 };

    sheet.addRow([]);
    sheet.addRow(["Total Bottles", summaryData.total_bottles || 0]);
    sheet.addRow(["Delivery Days", summaryData.delivery_days || 0]);
    sheet.addRow(["Total Amount", summaryData.total_amount || 0]);
    sheet.addRow([]);

    const headerRow = sheet.addRow(["Date", "Bottles", "Price", "Amount"]);
    headerRow.font = { bold: true };

    entries.forEach((e) => {
      if (!e?.date) return;

      sheet.addRow([
        new Date(e.date).toISOString().split("T")[0],
        e.bottle_count || 0,
        e.price_per_bottle || 0,
        e.amount || 0,
      ]);
    });

    sheet.addRow([]);

    const totalRow = sheet.addRow([
      "TOTAL",
      summaryData.total_bottles || 0,
      "-",
      summaryData.total_amount || 0,
    ]);

    totalRow.font = { bold: true };

    totalRow.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
      };
    });

    sheet.columns.forEach((col) => {
      col.width = 15;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=MonthlyReport-${month}-${year}.xlsx`,
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.send(buffer);
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
};
