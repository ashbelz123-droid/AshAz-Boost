const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();

/* ================= BASIC SETUP ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FILES ================= */
app.use(express.static(path.join(__dirname, "public")));

/* ================= DUMMY USERS ================= */
let users = {
  "user@ashmediaboost.com": {
    password: "123456",
    wallet: 0,
    orders: []
  }
};

/* ================= AUTH ================= */
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (users[email] && users[email].password === password) {
    return res.json({ success: true });
  }
  res.json({ success: false, error: "Invalid login" });
});

app.post("/api/signup", (req, res) => {
  const { email, password } = req.body;

  if (users[email]) {
    return res.json({ error: "User already exists" });
  }

  users[email] = { password, wallet: 0, orders: [] };
  res.json({ success: true });
});

/* ================= GODSMM CONFIG ================= */
const GODSMM_API = "https://godsmm.com/api/v2";
const GODSMM_KEY = "PASTE_YOUR_NEW_GODSMM_KEY_HERE"; // TEMP – works without dotenv

/* ================= GET SERVICES ================= */
app.get("/api/services", async (req, res) => {
  try {
    const r = await axios.post(GODSMM_API, {
      key: GODSMM_KEY,
      action: "services"
    });

    // Add 1.8x profit
    const services = r.data.map(s => ({
      id: s.service || s.services,
      category: s.Category,
      name: s.name,
      min: s.min,
      max: s.max,
      rate: (parseFloat(s.rate) * 1.8).toFixed(2)
    }));

    res.json(services);
  } catch (e) {
    res.json([]);
  }
});

/* ================= ADD ORDER ================= */
app.post("/api/order", async (req, res) => {
  const { email, service, link, quantity } = req.body;

  if (!users[email]) {
    return res.json({ error: "User not found" });
  }

  try {
    const r = await axios.post(GODSMM_API, {
      key: GODSMM_KEY,
      action: "add",
      service,
      link,
      quantity
    });

    users[email].orders.push({
      orderId: r.data.order,
      status: "Pending"
    });

    res.json({ success: true, orderId: r.data.order });
  } catch (e) {
    res.json({ error: "Order failed" });
  }
});

/* ================= ORDER STATUS ================= */
app.post("/api/status", async (req, res) => {
  try {
    const r = await axios.post(GODSMM_API, {
      key: GODSMM_KEY,
      action: "status",
      order: req.body.order
    });
    res.json(r.data);
  } catch (e) {
    res.json({ error: "Status check failed" });
  }
});

/* ================= ROUTES ================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("AshMediaBoost running on port " + PORT);
});
