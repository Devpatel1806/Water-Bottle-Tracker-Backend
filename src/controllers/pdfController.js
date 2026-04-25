const PDFDocument = require("pdfkit");
const BottleEntry = require("../models/BottleEntry");
const MonthlySummary = require("../models/MonthlySummary");
 
exports.generateMonthlyPDF = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: "Month and year required" });
    }
 
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
 
    const monthIndex = Number(month) - 1;
    const monthName = monthNames[monthIndex] || "Unknown";
 
    const summary =
      (await MonthlySummary.findOne({
        month: Number(month),
        year: Number(year),
      })) || {};
 
    const entries =
      (await BottleEntry.find({
        month: Number(month),
        year: Number(year),
      }).sort({ date: 1 })) || [];
 
    const doc = new PDFDocument({ margin: 30, size: "A4" });
 
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=MonthlyReport-${monthName}-${year}.pdf`,
    );
 
    doc.pipe(res);
 
    // Title
    doc.fontSize(18).text("Water Bottle Tracker Report", {
      align: "center",
      underline: true,
    });
 
    doc.moveDown(0.5);
 
    doc.fontSize(14).text(`Month: ${monthName} ${year}`, {
      align: "center",
    });
 
    doc.moveDown(1);
 
    // Summary
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Monthly Summary", { underline: true });
 
    doc.moveDown(0.5);
    doc.font("Helvetica");
 
    doc.text(`Total Bottles: ${summary.total_bottles || 0}`);
    doc.text(`Delivery Days: ${summary.delivery_days || 0}`);
    doc.text(`Total Amount: ${summary.total_amount || 0}`);
 
    doc.moveDown(1);
 
    // Table setup
    const tableTop = doc.y;
 
    // Updated column positions (added numbering column)
    const columnPositions = [40, 80, 220, 320, 420];
 
    // Headers
    doc.font("Helvetica-Bold");
    const headers = ["#", "Date", "Bottles", "Price", "Amount"];
 
    headers.forEach((h, i) => {
      doc.text(h, columnPositions[i], tableTop);
    });
 
    // Header underline
    doc
      .moveTo(35, tableTop + 15)
      .lineTo(560, tableTop + 15)
      .stroke();
 
    let y = tableTop + 25;
 
    doc.font("Helvetica");
 
    let totalBottles = 0;
    let totalAmount = 0;
 
    entries.forEach((e, index) => {
      const dateStr = e.date
        ? new Date(e.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "-";
 
      // Number column
      doc.text(index + 1, columnPositions[0], y);
 
      doc.text(dateStr, columnPositions[1], y);
      doc.text(e.bottle_count || 0, columnPositions[2], y);
      doc.text(e.price_per_bottle || 0, columnPositions[3], y);
      doc.text(e.amount || 0, columnPositions[4], y);
 
      totalBottles += e.bottle_count || 0;
      totalAmount += e.amount || 0;
 
      y += 20;
 
      // Page break
      if (y > 750) {
        doc.addPage();
        y = 50;
      }
    });
 
    // Line before total
    doc.moveTo(35, y).lineTo(560, y).stroke();
 
    y += 10;
 
    // Total row
    doc.font("Helvetica-Bold");
    doc.text("TOTAL", columnPositions[1], y); // shifted because of No. column
    doc.text(totalBottles, columnPositions[2], y);
    doc.text("-", columnPositions[3], y);
    doc.text(totalAmount, columnPositions[4], y);
 
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("server error");
  }
};
 
 