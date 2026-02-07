const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------------------
// SANDBOX DATA
// ---------------------

let walletDB = { defaultUser: 5000 }; // starting UGX
let ordersDB = { defaultUser: [] };

// Example services (simulating provider)
const services = [
  {
    id: 1,
    platform: "instagram",
    name: "Instagram Followers",
    price_usd: 0.5,
    limit: "Max 10,000",
    quality: "High Quality",
    refill: "No Refill",
    start: "Instant Start"
  },
  {
    id: 2,
    platform: "twitter",
    name: "Twitter Likes",
    price_usd: 0.2,
    limit: "Max 5,000",
    quality: "Real Accounts",
    refill: "Enabled",
    start: "Instant Start"
  },
  {
    id: 3,
    platform: "facebook",
    name: "Facebook Likes",
    price_usd: 0.3,
    limit: "Max 10,000",
    quality: "High Quality",
    refill: "No Refill",
    start: "Instant Start"
  },
  {
    id: 4,
    platform: "youtube",
    name: "YouTube Views",
    price_usd: 0.1,
    limit: "Max 50,000",
    quality: "Real Views",
    refill: "Enabled",
    start: "Instant Start"
  },
  {
    id: 5,
    platform: "telegram",
    name: "Telegram Members",
    price_usd: 1.0,
    limit: "Max 10M",
    quality: "High Quality",
    refill: "No Refill",
    start: "Instant Start"
  },
  {
    id: 6,
    platform: "tiktok",
    name: "TikTok Likes",
    price_usd: 0.25,
    limit: "Max 10,000",
    quality: "High Quality",
    refill: "No Refill",
    start: "Instant Start"
  },
  {
    id: 7,
    platform: "linkedin",
    name: "LinkedIn Connections",
    price_usd: 0.4,
    limit: "Max 5,000",
    quality: "Real Accounts",
    refill: "No Refill",
    start: "Instant Start"
  }
];

// ---------------------
// ROUTES
// ---------------------

// Health check
app.get("/health", (req, res) => res.send("OK"));

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ---------------------
// API ROUTES
// ---------------------

// Get services
app.get("/api/services", (req, res) => {
  res.json({ services });
});

// Get wallet balance
app.get("/api/wallet", (req, res) => {
  const user = req.query.user || "defaultUser";
  res.json({ wallet: walletDB[user] || 0 });
});

// Deposit (MTN/Airtel)
app.post("/api/deposit", (req, res) => {
  const { user = "defaultUser", amount, channel, phone } = req.body;
  if (!amount || amount < 2000) return res.json({ error: "Minimum deposit is 2000 UGX" });
  if (!walletDB[user]) walletDB[user] = 0;
  walletDB[user] += parseInt(amount);

  // Simulate redirect URL (payment page)
  res.json({ wallet: walletDB[user], redirect_url: null });
});

// Place order
app.post("/api/order", (req, res) => {
  const { user = "defaultUser", service, quantity, url } = req.body;
  if (!service || !quantity || !url) return res.json({ error: "Fill all fields" });
  
  const selectedService = services.find(s => s.platform === service);
  if (!selectedService) return res.json({ error: "Service not found" });

  const EXCHANGE_RATE = 3500;
  const MULTIPLIER = 2;
  const totalPrice = Math.ceil(selectedService.price_usd * EXCHANGE_RATE * MULTIPLIER * quantity);

  if ((walletDB[user] || 0) < totalPrice) return res.json({ error: "Insufficient wallet balance" });

  // Deduct wallet
  walletDB[user] -= totalPrice;

  // Save order
  const order = {
    service: selectedService.name,
    quantity,
    url,
    priceUGX: totalPrice,
    status: "Pending"
  };

  if (!ordersDB[user]) ordersDB[user] = [];
  ordersDB[user].push(order);

  res.json({ wallet: walletDB[user], order });
});

// Get user orders
app.get("/api/orders", (req, res) => {
  const user = req.query.user || "defaultUser";
  res.json({ orders: ordersDB[user] || [] });
});

// ---------------------
// START SERVER
// ---------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
