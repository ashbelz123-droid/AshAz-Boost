const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const GODSMM_KEY = "YOUR_GODSMM_API_KEY"; // replace with your key

// Dummy DB (replace with real DB)
let users = { "user@ashmediaboost.com": { wallet: 0, orders: [] } };

// Home page
app.get("/", (req,res) => res.sendFile(__dirname + "/public/index.html"));
app.get("/dashboard", (req,res) => res.sendFile(__dirname + "/public/dashboard.html"));

// Fetch wallet
app.get("/api/wallet/:email", (req,res)=>{
  const u = users[req.params.email];
  res.json({ wallet: u ? u.wallet : 0 });
});

// Deposit money
app.post("/api/deposit", (req,res)=>{
  const { email, amount } = req.body;
  if(!users[email]) users[email]={ wallet:0, orders:[] };
  users[email].wallet += parseInt(amount);
  res.json({ success:true, wallet: users[email].wallet });
});

// Fetch GodSMM services
app.get("/api/services", async (req,res)=>{
  try{
    const response = await axios.post("https://godsmm.com/api/v2",{
      key:GODSMM_KEY,
      action:"services"
    });
    // Filter only real services and calculate profit
    const services = response.data.map(s=>{
      return {
        id: s.service,
        name: s.name,
        category: s.Category,
        priceUGX: s.rate*1.8*5000, // 1.8x profit, example USD->UGX rate
        min: s.min,
        max: s.max,
        desc: `${s.type} | Min:${s.min} Max:${s.max}`,
        platform: s.Category
      };
    });
    res.json(services);
  }catch(err){ res.json([]); }
});

// Place order via GodSMM
app.post("/api/order", async (req,res)=>{
  const { email, service, link, quantity, price } = req.body;
  if(!users[email]) users[email]={ wallet:0, orders:[] };
  if(users[email].wallet < price) return res.json({ error:"Insufficient balance" });

  try{
    const response = await axios.post("https://godsmm.com/api/v2", {
      key:GODSMM_KEY,
      action:"add",
      service: service,
      link: link,
      quantity: quantity
    });

    // Deduct wallet
    users[email].wallet -= price;

    // Save order
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

// Fetch user orders
app.get("/api/orders/:email",(req,res)=>{
  const u = users[req.params.email];
  res.json(u ? u.orders : []);
});

// Health check
app.get("/health",(req,res)=>res.send("OK"));

app.listen(PORT,"0.0.0.0",()=>console.log(`✅ Server running on port ${PORT}`));
