const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== JAP CONFIG =====
const JAP_API_KEY = "YOUR_JAP_API_KEY"; // Replace with your JAP key
const JAP_API_URL = "https://justanotherpanel.com/api/v2";
const PROFIT_MULTIPLIER = 1.5; // 50% profit
// ======================

// Dummy user
let users = {
  user: { wallet: 0, orders: [] }
};

// Home
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

// Dashboard
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

// Get live JAP services
app.get("/api/services", async (req, res) => {
  try {
    const response = await axios.post(JAP_API_URL, {
      key: JAP_API_KEY,
      action: "services"
    });
    res.json(response.data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// Deposit wallet
app.post("/api/deposit", (req, res) => {
  const { amount } = req.body;
  if (amount < 500) return res.json({ error: "Minimum deposit is 500 UGX" });

  users.user.wallet += amount;
  res.json({ wallet: users.user.wallet });
});

// Place order with JAP & 1.5x profit
app.post("/api/order", async (req, res) => {
  const { service, quantity, url } = req.body;

  try {
    // Get JAP services
    const response = await axios.post(JAP_API_URL, {
      key: JAP_API_KEY,
      action: "services"
    });

    const svc = Object.values(response.data).find(s => s.name === service);
    if (!svc) return res.json({ error: "Service not found" });

    const priceUSD = svc.price * quantity;
    const priceUGX = Math.ceil(priceUSD * 3500); // Convert USD → UGX
    const yourPriceUGX = Math.ceil(priceUGX * PROFIT_MULTIPLIER);

    if (users.user.wallet < yourPriceUGX)
      return res.json({ error: "Insufficient balance" });

    users.user.wallet -= yourPriceUGX;

    // Place order on JAP
    const orderRes = await axios.post(JAP_API_URL, {
      key: JAP_API_KEY,
      action: "add",
      service: svc.id,
      link: url,
      quantity: quantity
    });

    let status = orderRes.data.order ? "Processing" : "Failed";
    if (status === "Failed") users.user.wallet += yourPriceUGX;

    users.user.orders.push({
      service,
      quantity,
      url,
      status
    });

    res.json({ success: true, wallet: users.user.wallet });
  } catch (err) {
    console.log(err);
    res.json({ error: "Order failed, refunded" });
  }
});

// Get user data
app.get("/api/data", (req, res) => res.json(users.user));

// Health check
app.get("/health", (req, res) => res.send("OK"));

// Start server
app.listen(PORT, "0.0.0.0", () => console.log("Server running on port " + PORT));
