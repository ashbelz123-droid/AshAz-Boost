require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// DATABASE
mongoose.connect(process.env.MONGO_URI);

// MODELS
const User = require("./models/User");
const Order = require("./models/Order");

// ROUTES
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

// Health check
app.get("/health", (req, res) => res.status(200).send("OK"));

// USER INFO
app.get("/api/user", async (req, res) => {
  let user = await User.findOne();
  if (!user) user = await User.create({ wallet: 0 });
  res.json(user);
});

// DEPOSIT
app.post("/api/deposit", async (req, res) => {
  const { amount } = req.body;
  const user = await User.findOne();
  user.wallet += amount;
  await user.save();
  res.json(user);
});

// FETCH SERVICES FROM SOCIALSPHARE
app.get("/api/services", async (req, res) => {
  try {
    const response = await axios.post("https://socialsphare.com/api/v2", {
      key: process.env.SOCIALSPHARE_API_KEY,
      action: "services"
    });
    // Convert prices to UGX
    const services = response.data.map(s => ({
      ...s,
      priceUGX: s.rate * 3500
    }));
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// PLACE ORDER
app.post("/api/order", async (req, res) => {
  const { service, link, quantity, price } = req.body;
  const user = await User.findOne();

  if (user.wallet < price) return res.status(400).json({ error: "Insufficient balance" });

  user.wallet -= price;
  await user.save();

  try {
    const response = await axios.post("https://socialsphare.com/api/v2", {
      key: process.env.SOCIALSPHARE_API_KEY,
      action: "add",
      service,
      link,
      quantity
    });

    const order = await Order.create({
      service,
      link,
      quantity,
      price,
      providerOrderId: response.data.order
    });

    res.json(order);
  } catch (err) {
    // Refund on API fail
    user.wallet += price;
    await user.save();
    res.status(500).json({ error: "Failed to place order, refunded wallet" });
  }
});

// AUTO STATUS CHECK & REFUND
setInterval(async () => {
  const orders = await Order.find({ refunded: false });
  for (const order of orders) {
    try {
      const statusRes = await axios.post("https://socialsphare.com/api/v2", {
        key: process.env.SOCIALSPHARE_API_KEY,
        action: "status",
        order: order.providerOrderId
      });

      order.status = statusRes.data.status;

      if (["Canceled", "Failed"].includes(order.status)) {
        const user = await User.findOne();
        user.wallet += order.price;
        order.refunded = true;
        await user.save();
      }

      if (order.status === "Partial") {
        const refund = (statusRes.data.remains / order.quantity) * order.price;
        const user = await User.findOne();
        user.wallet += refund;
        order.refunded = true;
        await user.save();
      }

      await order.save();
    } catch (err) {
      console.log("Status check failed for order:", order._id);
    }
  }
}, 300000); // every 5 min

app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on port ${PORT}`));
