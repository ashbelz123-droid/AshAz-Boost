const express = require("express");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const GODSMM_URL = "https://godsmm.com/api/v2";
const PROFIT_MULTIPLIER = 1.8;

/* ---------------- USERS (TEMP STORAGE) ---------------- */
let users = {
  "user@ashmediaboost.com": { password: "123456", wallet: 0, orders: [] }
};

/* ---------------- AUTH ---------------- */
app.post("/api/login", (req,res)=>{
  const { email, password } = req.body;
  if(users[email] && users[email].password === password){
    res.json({ success:true });
  } else {
    res.json({ error:"Invalid login" });
  }
});

app.post("/api/signup", (req,res)=>{
  const { email, password } = req.body;
  if(users[email]) return res.json({ error:"User exists" });
  users[email] = { password, wallet:0, orders:[] };
  res.json({ success:true });
});

/* ---------------- GODSMM SERVICES ---------------- */
app.get("/api/services", async (req,res)=>{
  try{
    const r = await axios.post(GODSMM_URL, {
      key: process.env.GODSMM_API_KEY,
      action: "services"
    });

    const services = r.data.map(s => ({
      id: s.service,
      category: s.Category,
      name: s.name,
      min: s.min,
      max: s.max,
      rate: Math.ceil(s.rate * PROFIT_MULTIPLIER),
      type: s.type
    }));

    res.json(services);
  }catch(err){
    console.log(err.message);
    res.status(500).json({ error:"Service fetch failed" });
  }
});

/* ---------------- PLACE ORDER ---------------- */
app.post("/api/order", async (req,res)=>{
  const { email, service, link, quantity } = req.body;
  if(!users[email]) return res.json({ error:"User not found" });

  try{
    const order = await axios.post(GODSMM_URL, {
      key: process.env.GODSMM_API_KEY,
      action: "add",
      service,
      link,
      quantity
    });

    users[email].orders.push({
      localId: Date.now(),
      apiOrderId: order.data.order,
      service,
      quantity,
      status: "Pending"
    });

    res.json({ success:true, orderId: order.data.order });
  }catch(err){
    console.log(err.message);
    res.status(500).json({ error:"Order failed" });
  }
});

/* ---------------- ORDER STATUS ---------------- */
app.get("/api/order-status/:id", async (req,res)=>{
  try{
    const r = await axios.post(GODSMM_URL, {
      key: process.env.GODSMM_API_KEY,
      action: "status",
      order: req.params.id
    });
    res.json(r.data);
  }catch(err){
    res.status(500).json({ error:"Status check failed" });
  }
});

/* ---------------- ROUTES ---------------- */
app.get("/", (_,res)=>res.sendFile(path.join(__dirname,"public","home.html")));
app.get("/login", (_,res)=>res.sendFile(path.join(__dirname,"public","login.html")));
app.get("/signup", (_,res)=>res.sendFile(path.join(__dirname,"public","signup.html")));
app.get("/dashboard", (_,res)=>res.sendFile(path.join(__dirname,"public","dashboard.html")));

app.listen(process.env.PORT, ()=>console.log("Server running"));
