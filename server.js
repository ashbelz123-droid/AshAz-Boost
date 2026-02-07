// --------------------
// AshAzBoost Server
// --------------------

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
require("dotenv").config();

const app = express();

// --------------------
// Basic Config
// --------------------
const PORT = process.env.PORT || 10000;
const BASE_URL = "https://ashaz-boost-1.onrender.com";

// --------------------
// Middleware
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// --------------------
// MongoDB Connection
// --------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

// --------------------
// Schemas & Models
// --------------------
const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema({
  amount: Number,
  status: String,
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.model("Admin", adminSchema);
const User = mongoose.model("User", userSchema);
const Order = mongoose.model("Order", orderSchema);

// --------------------
// Auth Middleware
// --------------------
function requireLogin(req, res, next) {
  if (!req.session.adminId) {
    return res.redirect("/login");
  }
  next();
}

// --------------------
// Auth Routes
// --------------------
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) return res.send("Invalid login");

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.send("Invalid login");

  req.session.adminId = admin._id;
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// --------------------
// Dashboard API
// --------------------
app.get("/api/dashboard", requireLogin, async (req, res) => {
  const users = await User.countDocuments();
  const orders = await Order.countDocuments();

  const revenueAgg = await Order.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const revenue = revenueAgg[0]?.total || 0;

  res.json({
    users,
    orders,
    revenue,
  });
});

// --------------------
// Dashboard Page
// --------------------
app.get("/", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// --------------------
// Start Server (LAST LINE)
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 AshAzBoost running at ${BASE_URL}`);
});
