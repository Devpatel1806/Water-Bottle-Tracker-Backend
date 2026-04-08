const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const entryRoutes = require("./routes/entryRoutes");
const priceRoutes = require("./routes/priceRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const exportRoutes = require("./routes/exportRoutes");
const pdfRoutes = require("./routes/pdfRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res, next) => {
  res.send("server is running ");
});

app.use("/api/entries", entryRoutes);
app.use("/api/price", priceRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/pdf", pdfRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).send(err.message || "Server Error");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
