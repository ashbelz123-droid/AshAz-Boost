require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");

const User = require("./models/User");
const Order = require("./models/Order");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI);

// demo user
app.get("/api/user", async (req, res) => {
  let user = await User.findOne();
  if (!user) {
    user = await User.create({ wallet: 0 });
  }
  res.json(user);
});

// add funds (sandbox)
app.post("/api/deposit", async (req, res) => {
  const { amount } = req.body;
  const user = await User.findOne();
  user.wallet += amount;
  await user.save();
  res.json(user);
});

// place order
app.post("/api/order", async (req, res) => {
  const { service, link, quantity, price } = req.body;
  const user = await User.findOne();

  if (user.wallet < price) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  user.wallet -= price;
  await user.save();

  const apiRes = await axios.post("https://www.socialsphare.com/api/v2", {
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
    providerOrderId: apiRes.data.order
  });

  res.json(order);
});

// auto status + refund
setInterval(async () => {
  const orders = await Order.find({ refunded: false });

  for (const order of orders) {
    const res = await axios.post("https://www.socialsphare.com/api/v2", {
      key: process.env.SOCIALSPHARE_API_KEY,
      action: "status",
      order: order.providerOrderId
    });

    order.status = res.data.status;

    if (["Canceled", "Failed"].includes(order.status)) {
      const user = await User.findOne();
      user.wallet += order.price;
      order.refunded = true;
      await user.save();
    }

    if (order.status === "Partial") {
      const refund =
        (res.data.remains / order.quantity) * order.price;
      const user = await User.findOne();
      user.wallet += refund;
      order.refunded = true;
      await user.save();
    }

    await order.save();
  }
}, 300000);

app.listen(process.env.PORT, () =>
  console.log("Server running")
);
