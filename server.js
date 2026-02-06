const express = require("express");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

// -------- MongoDB Atlas Connection --------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Admin schema
const adminSchema = new mongoose.Schema({
  username: String,
  password: String // hashed password
});

const Admin = mongoose.model("Admin", adminSchema);

// -------- Middleware --------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "ashaz-boost-secret",
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// -------- Auth Middleware --------
function requireLogin(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect("/login.html");
}

// -------- Routes --------
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  if (!admin) return res.redirect("/login.html");

  const match = await bcrypt.compare(password, admin.password);
  if (match) {
    req.session.loggedIn = true;
    res.redirect("/");
  } else {
    res.redirect("/login.html");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

app.get("/", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`🚀 AshAz-Boost running on port ${PORT}`);
});
