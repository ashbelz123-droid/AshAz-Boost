const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch"); // make sure npm install node-fetch@2

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ----------------------
// CONFIG
// ----------------------
const GODSMM_KEY = "YOUR_GODSMM_API_KEY"; // replace with your key

// ----------------------
// DUMMY USER DATA
// ----------------------
let users = {
  "user@ashmediaboost.com": {
    wallet: 0,
    orders: []
  }
};

// ----------------------
// ROUTES
// ----------------------

// Serve HTML
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

// GET wallet
app.get("/api/wallet/:email", (req, res) => {
  const u = users[req.params.email];
  if (!u) return res.json({ wallet: 0 });
  res.json({ wallet: u.wallet });
});

// GET services from GodSMM
app.get("/api/services", async (req, res) => {
  try {
    const response = await fetch("https://godsmm.com/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: GODSMM_KEY, action: "services" })
    });
    const data = await response.json();

    // transform services to include UGX price
    const services = data.map(s => ({
      id: s.service || s.services,
      name: s.name,
      category: s.Category,
      desc: `Type: ${s.type}, Min: ${s.min}, Max: ${s.max}`,
      priceUGX: Math.round(parseFloat(s.rate) * 3500) // base conversion 1 USD = 3500 UGX
    }));

    res.json(services);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// POST deposit
app.post("/api/deposit", (req, res) => {
  const { email, amount } = req.body;
  if (!users[email]) users[email] = { wallet: 0, orders: [] };
  users[email].wallet += parseInt(amount);
  res.json({ success: true });
});

// POST order
app.post("/api/order", async (req, res) => {
  const { email, service, link, quantity, price } = req.body;
  if (!users[email]) users[email] = { wallet: 0, orders: [] };

  if (users[email].wallet < price) return res.status(400).json({ error: "Insufficient wallet" });

  // Deduct wallet
  users[email].wallet -= price;

  // Place order on GodSMM
  try {
    const response = await fetch("https://godsmm.com/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: GODSMM_KEY,
        action: "add",
        service,
        link,
        quantity
      })
    });
    const data = await response.json();

    // save order locally
    users[email].orders.push({
      id: data.order || Math.random(),
      service,
      link,
      quantity,
      price,
      status: "pending"
    });

    res.json({ success: true, order: data.order });
  } catch (err) {
    // refund if failed
    users[email].wallet += parseInt(price);
    console.error(err);
    res.status(500).json({ error: "Failed to place order. Wallet refunded." });
  }
});

// GET order status
app.get("/api/orders/:email", async (req, res) => {
  const u = users[req.params.email];
  if (!u) return res.json([]);

  const orderIds = u.orders.map(o => o.id).join(",");
  if (!orderIds) return res.json([]);

  try {
    const response = await fetch("https://godsmm.com/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: GODSMM_KEY,
        action: "status",
        order: orderIds
      })
    });
    const data = await response.json();

    // update local order status
    u.orders.forEach(o => {
      if (data[o.id] && data[o.id].status) o.status = data[o.id].status;

      // auto refund for canceled
      if (data[o.id] && data[o.id].status === "Canceled") {
        u.wallet += o.price;
      }
    });

    res.json(u.orders);
  } catch (err) {
    console.error(err);
    res.json(u.orders);
  }
});

// Health check
app.get("/health", (req, res) => res.status(200).send("OK"));

app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on port ${PORT}`));
