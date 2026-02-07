require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || "https://ashaz-boost-1.onrender.com";

/* ------------------ MongoDB ------------------ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

/* ------------------ Schema ------------------ */
const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

const Admin = mongoose.model("Admin", adminSchema);

/* ------------------ Middleware ------------------ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI
    }),
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

/* ------------------ Auth Guard ------------------ */
function requireLogin(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect(`${BASE_URL}/login.html`);
}

/* ------------------ Routes ------------------ */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) return res.redirect(`${BASE_URL}/login.html`);

  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.redirect(`${BASE_URL}/login.html`);

  req.session.loggedIn = true;
  res.redirect(`${BASE_URL}/`);
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect(`${BASE_URL}/login.html`);
  });
});

app.get("/", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ------------------ Start ------------------ */
app.listen(PORT, () => {
  console.log(`🚀 AshAz-Boost-1 running on ${BASE_URL}`);
});
