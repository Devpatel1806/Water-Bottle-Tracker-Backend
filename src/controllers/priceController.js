const BottlePrice = require("../models/BottlePrice");

exports.setPrice = async (req, res, next) => {
  try {
    const { price } = req.body;

    if (price !== undefined && price <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }

    await BottlePrice.updateMany({}, { status: "ARCHIVED" });

    const newPrice = new BottlePrice({
      price,
      effective_from: new Date(),
      status: "ACTIVE",
    });

    const saved = await newPrice.save();
    res.status(201).json(saved);
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
};

exports.getCurrentPrice = async (req, res, next) => {
  try {
    const price = await BottlePrice.findOne().sort({ effective_from: -1 });

    if (!price) {
      return res.json({
        price: 5.0,
        message: "Default price is being used because no price is set yet.",
      });
    }

    res.json(price);
  } catch (err) {
    res.status(500).send("server error");
  }
};
exports.getPriceHistory = async (req, res, next) => {
  try {
    const DEFAULT_PRICE = 5.0;

    const prices = await BottlePrice.find().sort({ effective_from: -1 });

    const defaultPriceRow = {
      price: DEFAULT_PRICE,
      effective_from: null,
      status: "DEFAULT",
      message: "System default price",
    };

    if (prices.length === 0) {
      return res.json([defaultPriceRow]);
    }

    const result = [
      ...prices.map((p) => ({
        ...p.toObject(),
        status: p.status || "ARCHIVED",
      })),
      defaultPriceRow,
    ];

    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("server error");
  }
};
