const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();

// 🔥 REQUIRED FOR RENDER
const PORT = process.env.PORT || 10000;

// MIDDLEWARES
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// STATIC FILES
app.use(express.static(path.join(__dirname, "public")));

// ROUTES
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// HEALTH CHECK (VERY IMPORTANT)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// TEST API ENDPOINT (PREVENT EARLY EXIT)
app.get("/api/test", (req, res) => {
  res.json({ status: "API working" });
});

// START SERVER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
