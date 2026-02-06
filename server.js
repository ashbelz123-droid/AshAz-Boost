const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "ashaz-boost-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Auth check
function requireLogin(req, res, next) {
  if (req.session.loggedIn) return next();
  res.redirect("/login.html");
}

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "ashaz123") {
    req.session.loggedIn = true;
    res.redirect("/");
  } else {
    res.redirect("/login.html?error=1");
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

// Protect dashboard
app.get("/", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 AshAz-Boost running on port ${PORT}`);
});
