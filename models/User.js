const mongoose = require("mongoose");

module.exports = mongoose.model("User", new mongoose.Schema({
  wallet: { type: Number, default: 0 }
}));
