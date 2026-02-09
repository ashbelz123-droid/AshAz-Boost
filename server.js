const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const crypto = require("crypto");
const path = require("path");
const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

// Dummy user DB
let users = {
  "user@ashmediaboost.com": { password:"123456", wallet:0, orders:[] }
};

// Login endpoint
app.post("/api/login",(req,res)=>{
  const { email, password } = req.body;
  if(users[email] && users[email].password === password){
    return res.json({ success:true });
  }else{
    return res.json({ error:"Invalid email or password" });
  }
});

// Signup endpoint
app.post("/api/signup",(req,res)=>{
  const { email, password } = req.body;
  if(users[email]) return res.json({ error:"User already exists" });
  users[email] = { password, wallet:0, orders:[] };
  return res.json({ success:true });
});

/* =================
   PesaPal Integration
================= */

const PESAPAL_CONSUMER_KEY = "YOUR_CONSUMER_KEY";
const PESAPAL_CONSUMER_SECRET = "YOUR_CONSUMER_SECRET";
const PESAPAL_SANDBOX = true; // true for testing

const PESAPAL_BASE = PESAPAL_SANDBOX
  ? "https://sandbox.pesapal.com/api"
  : "https://www.pesapal.com/API";

// Create payment request
app.post("/api/deposit", async (req,res)=>{
  const { email, amount, provider } = req.body;
  if(!users[email]) return res.json({ error:"User not found" });

  const orderId = Date.now(); // unique ID
  const callback_url = `http://yourdomain.com/api/pesapal-callback?email=${email}`;

  // Build XML payload
  const postData = `
    <PesapalDirectOrderInfo xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
      Amount="${amount}" 
      Description="Wallet deposit for ${email}" 
      Type="MERCHANT" 
      Reference="${orderId}" 
      Currency="UGX" 
      CallbackURL="${callback_url}" 
      xmlns="http://www.pesapal.com"/>
  `;

  try{
    const resp = await axios.post(`${PESAPAL_BASE}/PostPesapalDirectOrderV4`, postData, {
      headers:{ "Content-Type":"application/xml" },
      auth:{ username:PESAPAL_CONSUMER_KEY, password:PESAPAL_CONSUMER_SECRET }
    });
    // Returns iframe link
    res.json({ success:true, url:resp.data });
  }catch(err){
    console.log(err.response?.data || err.message);
    res.json({ error:"Payment request failed" });
  }
});

// PesaPal callback (update wallet)
app.post("/api/pesapal-callback", (req,res)=>{
  const { email, transaction_id, status, amount } = req.body;
  if(status==="Completed" && users[email]){
    users[email].wallet += parseInt(amount);
    res.send("Wallet updated");
  }else{
    res.send("Payment failed or user not found");
  }
});

/* =================
   Routes
================= */
app.get("/", (req,res)=>res.sendFile(path.join(__dirname,"public","home.html")));
app.get("/login", (req,res)=>res.sendFile(path.join(__dirname,"public","login.html")));
app.get("/signup", (req,res)=>res.sendFile(path.join(__dirname,"public","signup.html")));
app.get("/dashboard", (req,res)=>res.sendFile(path.join(__dirname,"public","dashboard.html")));

app.listen(10000, ()=>console.log("Server running on port 10000"));
