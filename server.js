const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

/* ===== CONFIG ===== */
const GODSMM_API_URL = "https://godsmm.com/api/v2";
const GODSMM_API_KEY = "PUT_YOUR_GODSMM_API_KEY_HERE";
const USD_TO_UGX = 3500;
const PROFIT_MULTIPLIER = 1.5;

/* ===== TEMP STORAGE (later DB) ===== */
let users = {};
let orders = [];

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ===== ROUTES ===== */
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public/index.html"))
);

app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "public/dashboard.html"))
);

/* ===== LOGIN (SIMPLE) ===== */
app.post("/api/login", (req, res) => {
  const { email } = req.body;
  if (!users[email]) users[email] = { wallet: 0 };
  res.json({ success: true });
});

/* ===== GET SERVICES ===== */
app.get("/api/services", async (req, res) => {
  try {
    const response = await axios.post(GODSMM_API_URL, {
      key: GODSMM_API_KEY,
      action: "services"
    });

    const services = response.data.map(s => ({
      id: s.service,
      name: s.name,
      category: s.category,
      desc: s.description || "High quality service",
      rateUGX: Math.ceil(s.rate * USD_TO_UGX * PROFIT_MULTIPLIER)
    }));

    res.json(services);
  } catch {
    res.status(500).json({ error: "Provider not responding" });
  }
});

/* ===== PLACE ORDER ===== */
app.post("/api/order", async (req, res) => {
  const { email, service, link, quantity, price } = req.body;

  if (users[email].wallet < price)
    return res.json({ error: "Insufficient balance" });

  users[email].wallet -= price;

  try {
    const orderRes = await axios.post(GODSMM_API_URL, {
      key: GODSMM_API_KEY,
      action: "add",
      service,
      link,
      quantity
    });

    orders.push({
      email,
      service,
      quantity,
      price,
      status: "Processing",
      providerOrderId: orderRes.data.order
    });

    res.json({ success: true });
  } catch {
    users[email].wallet += price; // REFUND
    res.json({ error: "Order failed, wallet refunded" });
  }
});

/* ===== WALLET DEPOSIT (SIMULATED) ===== */
app.post("/api/deposit", (req, res) => {
  const { email, amount } = req.body;
  if (amount < 500) return res.json({ error: "Min 500 UGX" });
  users[email].wallet += amount;
  res.json({ success: true });
});

/* ===== GET WALLET ===== */
app.get("/api/wallet/:email", (req, res) => {
  res.json({ wallet: users[req.params.email]?.wallet || 0 });
});

/* ===== HEALTH CHECK ===== */
app.get("/health", (req, res) => res.send("OK"));

/* ===== START SERVER ===== */
app.listen(PORT, "0.0.0.0", () =>
  console.log("✅ Server running on", PORT)
);
