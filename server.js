const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const GODSMM_API_KEY = "c82ad88484987b44b133ed4a922aa1d8a84e2a47967e50c596cd6b8f54387fb2";

// Fetch services
app.get("/api/services", async (req, res) => {
  try {
    const response = await fetch("https://godsmm.com/api/v2", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ key:GODSMM_API_KEY, action:"services" })
    });
    const data = await response.json();
    res.json(data);
  } catch(err){ res.json([]); }
});

// Place order
app.post("/api/order", (req,res) => {
  const { service, link, quantity } = req.body;
  res.json({ order: Math.floor(Math.random() * 1000000) });
});

// Pesapal deposit
app.post("/api/pesapal", (req,res)=>{
  const { amount } = req.body;
  const payment_url = `https://demo.pesapal.com/payment?amount=${amount}&reference=${Date.now()}`;
  res.json({ payment_url });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
