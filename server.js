const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ================================
// WALLET & ORDERS STORAGE (JSON)
// ================================
const DATA_FILE = path.join(__dirname, "data.json");

let data = { users: {} };

// Load data from file
if (fs.existsSync(DATA_FILE)) {
  data = JSON.parse(fs.readFileSync(DATA_FILE));
}

// Save data
function saveData() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ================================
// PROVIDER PRICES
// ================================
const EXCHANGE_RATE = 3500; // 1 USD = 3500 UGX
const MULTIPLIER = 2; // Your price = provider price * 2

// Example provider prices (normally fetched via API)
const providerPricesUSD = {
  instagram: 1, // $1
  twitter: 0.5,
  facebook: 2,
  youtube: 1.5,
  telegram: 0.8,
  tiktok: 1.2,
  linkedin: 2
};

// Convert provider prices to your UGX price
function getPrice(service) {
  if (!providerPricesUSD[service]) return 0;
  return Math.ceil(providerPricesUSD[service] * EXCHANGE_RATE * MULTIPLIER);
}

// ================================
// ROUTES
// ================================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));
app.get("/health", (req, res) => res.send("OK"));

// ================================
// API: WALLET
// ================================
app.get("/api/wallet", (req, res) => {
  const user = req.query.user || "defaultUser";
  if (!data.users[user]) data.users[user] = { wallet: 0, orders: [] };
  res.json({ wallet: data.users[user].wallet });
});

// ================================
// API: DEPOSIT (Pesapal sandbox simulation)
// ================================
app.post("/api/deposit", (req, res) => {
  const { user = "defaultUser", amount, channel, phone } = req.body;
  if (!amount || amount < 2000) return res.status(400).json({ error: "Minimum deposit is 2000 UGX" });

  if (!data.users[user]) data.users[user] = { wallet: 0, orders: [] };
  data.users[user].wallet += Number(amount);
  saveData();

  // Generate Pesapal sandbox payment URL (simulation)
  const pesapalUrl = `https://www.sandbox.pesapal.com/pay?amount=${amount}&phone=${phone}&channel=${channel}`;

  res.json({ wallet: data.users[user].wallet, redirect_url: pesapalUrl });
});

// ================================
// API: CREATE ORDER
// ================================
app.post("/api/order", (req, res) => {
  const { user = "defaultUser", service, quantity, url } = req.body;
  if (!service || !quantity || !url) return res.status(400).json({ error: "Missing order info" });

  if (!data.users[user]) data.users[user] = { wallet: 0, orders: [] };

  const priceUGX = getPrice(service) * Number(quantity);

  if (data.users[user].wallet < priceUGX) return res.status(400).json({ error: "Insufficient wallet balance" });

  // Deduct wallet
  data.users[user].wallet -= priceUGX;

  // Save order
  const order = { service, quantity, url, priceUGX, status: "pending", createdAt: new Date().toISOString() };
  data.users[user].orders.push(order);
  saveData();

  res.json({ message: "Order placed!", wallet: data.users[user].wallet, order });
});

// ================================
// API: GET ORDERS
// ================================
app.get("/api/orders", (req, res) => {
  const user = req.query.user || "defaultUser";
  if (!data.users[user]) data.users[user] = { wallet: 0, orders: [] };
  res.json({ orders: data.users[user].orders });
});

// ================================
// START SERVER
// ================================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
