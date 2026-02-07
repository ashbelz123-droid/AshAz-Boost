const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 10000;

/* -------------------- PESAPAL SANDBOX KEYS -------------------- */
/* ⚠️ Replace with YOUR real sandbox keys */
const PESAPAL_CONSUMER_KEY = "PASTE_SANDBOX_KEY_HERE";
const PESAPAL_CONSUMER_SECRET = "PASTE_SANDBOX_SECRET_HERE";
const PESAPAL_BASE_URL = "https://cybqa.pesapal.com/pesapalv3";

/* ------------------------------------------------------------- */

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

/* -------------------- ROUTES -------------------- */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

/* -------------------- PESAPAL TOKEN -------------------- */
async function getPesapalToken() {
  const response = await axios.post(
    `${PESAPAL_BASE_URL}/api/Auth/RequestToken`,
    {
      consumer_key: PESAPAL_CONSUMER_KEY,
      consumer_secret: PESAPAL_CONSUMER_SECRET
    }
  );
  return response.data.token;
}

/* -------------------- CREATE PAYMENT -------------------- */
app.post("/api/deposit", async (req, res) => {
  const { amount, phone, channel } = req.body;

  if (!amount || amount < 2000) {
    return res.status(400).json({ error: "Minimum deposit is 2000 UGX" });
  }

  try {
    const token = await getPesapalToken();

    const payment = await axios.post(
      `${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`,
      {
        id: "ASHAZ_" + Date.now(),
        currency: "UGX",
        amount: amount,
        description: "AshAzBoost Wallet Deposit",
        callback_url: "https://ashaz-boost-1.onrender.com/dashboard",
        notification_id: "IPN_ID_FROM_PESAPAL",
        billing_address: {
          phone_number: phone,
          country_code: "UG"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      redirect_url: payment.data.redirect_url
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Pesapal payment failed" });
  }
});

/* -------------------- START SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
