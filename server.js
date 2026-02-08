const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// --------------------
// DUMMY USERS DB
// --------------------
let users = {
  "user@ashmediaboost.com": { password:"123456", wallet:0, orders:[] }
};

// --------------------
// LOGIN ENDPOINT
// --------------------
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if(users[email] && users[email].password === password){
    return res.json({ success:true });
  } else {
    return res.json({ error:"Invalid email or password" });
  }
});

// --------------------
// GODSMM CONFIG
// --------------------
const GODSMM_KEY = "YOUR_GODSMM_API_KEY"; // Replace with your key

// Fetch wallet
app.get("/api/wallet/:email", (req, res) => {
  const u = users[req.params.email];
  res.json({ wallet: u ? u.wallet : 0 });
});

// Deposit
app.post("/api/deposit", (req, res) => {
  const { email, amount } = req.body;
  if(!users[email]) users[email] = { wallet:0, orders:[] };
  users[email].wallet += parseInt(amount);
  res.json({ success:true, wallet: users[email].wallet });
});

// Fetch GodSMM services
app.get("/api/services", async (req, res) => {
  try{
    const response = await axios.post("https://godsmm.com/api/v2", {
      key: GODSMM_KEY,
      action: "services"
    });
    const services = response.data.map(s => {
      return {
        id: s.service || s.services,
        name: s.name,
        category: s.Category,
        priceUGX: s.rate * 1.8 * 500, // 1.8x profit, 500UGX base
        min: s.min,
        max: s.max,
        desc: `${s.type} | Min:${s.min} Max:${s.max}`,
        platform: s.Category
      };
    });
    res.json(services);
  }catch(err){ res.json([]); }
});

// Place order
app.post("/api/order", async (req,res) => {
  const { email, service, link, quantity, price } = req.body;
  if(!users[email]) users[email] = { wallet:0, orders:[] };
  if(users[email].wallet < price) return res.json({ error:"Insufficient balance" });

  try{
    const response = await axios.post("https://godsmm.com/api/v2", {
      key: GODSMM_KEY,
      action: "add",
      service: service,
      link: link,
      quantity: quantity
    });

    users[email].wallet -= price;
    const orderId = response.data.order;
    users[email].orders.push({
      id: orderId,
      platform: "Service",
      service,
      link,
      quantity,
      price,
      status: "Pending"
    });
    res.json({ success:true });
  }catch(err){
    res.json({ error:"Failed to place order" });
  }
});

// Get orders
app.get("/api/orders/:email", (req,res) => {
  const u = users[req.params.email];
  res.json(u ? u.orders : []);
});

// --------------------
// ROUTES FOR PAGES
// --------------------
app.get("/", (req,res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/login", (req,res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/dashboard", (req,res) => res.sendFile(path.join(__dirname, "public", "dashboard.html")));

// Health check
app.get("/health", (req,res) => res.send("OK"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
