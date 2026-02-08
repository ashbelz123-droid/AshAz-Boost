const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

let users = {
  user: { wallet: 0, orders: [] }
};

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Wallet
app.post("/api/deposit", (req, res) => {
  const { amount } = req.body;
  if (amount < 500) {
    return res.json({ error: "Minimum deposit is 500 UGX" });
  }
  users.user.wallet += amount;
  res.json({ wallet: users.user.wallet });
});

// Place Order
app.post("/api/order", (req, res) => {
  const { service, quantity, price } = req.body;
  if (users.user.wallet < price) {
    return res.json({ error: "Insufficient balance" });
  }

  users.user.wallet -= price;
  users.user.orders.push({
    service,
    quantity,
    status: "Processing"
  });

  res.json({ success: true, wallet: users.user.wallet });
});

// Get Data
app.get("/api/data", (req, res) => {
  res.json(users.user);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
