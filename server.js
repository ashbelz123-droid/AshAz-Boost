require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const API_URL = "https://godsmm.com/api/v2";
const API_KEY = process.env.GODSMM_API_KEY;

/* ✅ PLACE ORDER */
app.post("/api/order", async (req, res) => {
  try {
    const { service, link, quantity } = req.body;

    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "add",
      service,
      link,
      quantity
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Order failed" });
  }
});

/* ✅ CHECK ORDER STATUS */
app.post("/api/status", async (req, res) => {
  try {
    const { order } = req.body;

    const response = await axios.post(API_URL, {
      key: API_KEY,
      action: "status",
      order
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Status check failed" });
  }
});

/* ✅ START SERVER */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
