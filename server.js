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

// Simple JSON wallet storage
const WALLET_FILE = path.join(__dirname, "wallets.json");
let wallets = {};

// Load wallet balances
if (fs.existsSync(WALLET_FILE)) {
  wallets = JSON.parse(fs.readFileSync(WALLET_FILE));
}

// Save wallets to file
function saveWallets() {
  fs.writeFileSync(WALLET_FILE, JSON.stringify(wallets, null, 2));
}

// Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));
app.get("/health", (req, res) => res.send("OK"));

// API: deposit
app.post("/api/deposit", (req, res) => {
  const { user = "defaultUser", amount, phone, channel } = req.body;

  if (!amount || amount < 2000) return res.status(400).json({ error: "Minimum deposit is 2000 UGX" });

  // Here you would generate Pesapal sandbox payment link
  // For demo, we return a fake sandbox link
  const fakePesapalUrl = `https://www.sandbox.pesapal.com/pay?amount=${amount}&phone=${phone}&channel=${channel}`;

  // Credit wallet immediately for demo (in real use, wait for IPN)
  if (!wallets[user]) wallets[user] = 0;
  wallets[user] += Number(amount);
  saveWallets();

  res.json({ message: "Deposit successful!", wallet: wallets[user], redirect_url: fakePesapalUrl });
});

// API: get wallet balance
app.get("/api/wallet", (req, res) => {
  const { user = "defaultUser" } = req.query;
  if (!wallets[user]) wallets[user] = 0;
  res.json({ wallet: wallets[user] });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
