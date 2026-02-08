const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "ash-secret-123",
  resave: false,
  saveUninitialized: true
}));

// ===== JAP CONFIG =====
const JAP_API_KEY = "YOUR_JAP_API_KEY"; // Replace with your JAP API key
const JAP_API_URL = "https://justanotherpanel.com/api/v2";
const PROFIT_MULTIPLIER = 1.5; // 50% profit
// ======================

// Dummy user store (in-memory)
let users = {}; // key = email, value = { wallet, orders }

// ===== ROUTES =====

// Google login callback (client sends email)
app.post("/api/login", (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  req.session.user = email;
  if (!users[email]) users[email] = { wallet: 0, orders: [], name };
  res.json({ success: true, user: users[email] });
});

// Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check session
app.get("/api/me", (req, res) => {
  const email = req.session.user;
  if (!email) return res.json({ loggedIn: false });
  res.json({ loggedIn: true, user: users[email] });
});

// Fetch JAP services
app.get("/api/services", async (req, res) => {
  try {
    const response = await axios.post(JAP_API_URL, {
      key: JAP_API_KEY,
      action: "services"
    });
    // Send only name, category, description, quality info (hide JAP price)
    const filtered = {};
    for (const id in response.data) {
      filtered[id] = {
        name: response.data[id].name,
        category: response.data[id].category,
        description: response.data[id].description || "High quality service",
        min: response.data[id].min,
        max: response.data[id].max
      };
    }
    res.json(filtered);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// Deposit wallet
app.post("/api/deposit", (req, res) => {
  const email = req.session.user;
  if (!email) return res.status(403).json({ error: "Login first" });

  const { amount } = req.body;
  if (amount < 500) return res.json({ error: "Minimum deposit is 500 UGX" });

  users[email].wallet += amount;
  res.json({ wallet: users[email].wallet });
});

// Place order
app.post("/api/order", async (req, res) => {
  const email = req.session.user;
  if (!email) return res.status(403).json({ error: "Login first" });

  const { service, quantity, url } = req.body;
  if (!service || !quantity || !url) return res.json({ error: "Fill all fields" });

  try {
    // Get JAP services
    const response = await axios.post(JAP_API_URL, {
      key: JAP_API_KEY,
      action: "services"
    });

    const svc = Object.values(response.data).find(s => s.name === service);
    if (!svc) return res.json({ error: "Service not found" });

    const priceUSD = svc.price * quantity;
    const priceUGX = Math.ceil(priceUSD * 3500 * PROFIT_MULTIPLIER);

    if (users[email].wallet < priceUGX) return res.json({ error: "Insufficient balance" });

    users[email].wallet -= priceUGX;

    // Place order on JAP
    const orderRes = await axios.post(JAP_API_URL, {
      key: JAP_API_KEY,
      action: "add",
      service: svc.id,
      link: url,
      quantity: quantity
    });

    let status = orderRes.data.order ? "Processing" : "Failed";
    if (status === "Failed") users[email].wallet += priceUGX;

    users[email].orders.push({ service, quantity, url, status });
    res.json({ success: true, wallet: users[email].wallet });
  } catch (err) {
    console.log(err);
    res.json({ error: "Order failed, refunded" });
  }
});

// Get user data
app.get("/api/data", (req, res) => {
  const email = req.session.user;
  if (!email) return res.json({ wallet:0, orders:[] });
  res.json(users[email]);
});

// Serve HTML
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

// Health check
app.get("/health", (req, res) => res.send("OK"));

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
