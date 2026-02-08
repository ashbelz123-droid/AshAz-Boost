const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

/* ===== CONFIG ===== */
const API_URL = "https://godsmm.com/api/v2";
const API_KEY = "PUT_YOUR_GODSMM_API_KEY_HERE";
const USD_TO_UGX = 3500;
const PROFIT = 1.5;

/* ===== MEMORY STORAGE (can move to DB later) ===== */
let users = {};
let orders = [];

/* ===== MIDDLEWARE ===== */
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

/* ===== ROUTES ===== */
app.get("/", (_, res) => res.sendFile(path.join(__dirname, "public/index.html")));
app.get("/dashboard", (_, res) => res.sendFile(path.join(__dirname, "public/dashboard.html")));

/* ===== LOGIN ===== */
app.post("/api/login", (req, res) => {
  const { email } = req.body;
  if (!users[email]) users[email] = { wallet: 0 };
  res.json({ success: true });
});

/* ===== SERVICES ===== */
app.get("/api/services", async (_, res) => {
  try {
    const r = await axios.post(API_URL, {
      key: API_KEY,
      action: "services"
    });

    const services = r.data.map(s => ({
      id: s.service,
      name: s.name,
      category: s.Category,
      min: s.min,
      max: s.max,
      desc: `${s.type} • Min ${s.min} • Max ${s.max}`,
      priceUGX: Math.ceil(s.rate * USD_TO_UGX * PROFIT)
    }));

    res.json(services);
  } catch {
    res.status(500).json({ error: "Service fetch failed" });
  }
});

/* ===== PLACE ORDER ===== */
app.post("/api/order", async (req, res) => {
  const { email, service, link, quantity, price } = req.body;

  if (users[email].wallet < price)
    return res.json({ error: "Insufficient balance" });

  users[email].wallet -= price;

  try {
    const r = await axios.post(API_URL, {
      key: API_KEY,
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
      orderId: r.data.order,
      status: "In progress"
    });

    res.json({ success: true });
  } catch {
    users[email].wallet += price;
    res.json({ error: "Order failed, refunded" });
  }
});

/* ===== ORDER STATUS SYNC ===== */
app.post("/api/sync", async (_, res) => {
  for (let o of orders) {
    try {
      const r = await axios.post(API_URL, {
        key: API_KEY,
        action: "status",
        order: o.orderId
      });

      const s = r.data;
      o.status = s.status;

      if (s.status === "Canceled") {
        users[o.email].wallet += o.price;
      }

      if (s.status === "Partial") {
        const refund =
          (parseInt(s.remains) / o.quantity) * o.price;
        users[o.email].wallet += Math.floor(refund);
      }
    } catch {}
  }
  res.json({ synced: true });
});

/* ===== WALLET ===== */
app.post("/api/deposit", (req, res) => {
  const { email, amount } = req.body;
  if (amount < 500) return res.json({ error: "Min 500 UGX" });
  users[email].wallet += amount;
  res.json({ success: true });
});

app.get("/api/wallet/:email", (req, res) =>
  res.json({ wallet: users[req.params.email]?.wallet || 0 })
);

/* ===== HEALTH ===== */
app.get("/health", (_, res) => res.send("OK"));

app.listen(PORT, "0.0.0.0", () =>
  console.log("✅ Server running on port", PORT)
);
