const mongoose = require("mongoose");

module.exports = mongoose.model("Order", new mongoose.Schema({
  service: String,
  link: String,
  quantity: Number,
  price: Number,
  providerOrderId: Number,
  status: String,
  refunded: { type: Boolean, default: false }
}));
