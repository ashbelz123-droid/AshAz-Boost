// --------------------------
// server.js
// --------------------------
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// --------------------------
// Middleware
// --------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // serve static files

// --------------------------
// MongoDB Connection
// --------------------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// --------------------------
// Session with MongoStore
// --------------------------
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// --------------------------
// Routes
// --------------------------
app.get('/', (req, res) => {
  res.send('🚀 AshAzBoost running!');
});

// Example dashboard route
app.get('/dashboard', (req, res) => {
  res.send(`
    <h1>AshAzBoost Dashboard</h1>
    <p>Users: 1248</p>
    <p>Orders: 312</p>
    <p>Revenue: $4,820</p>
  `);
});

// --------------------------
// Start Server
// --------------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 AshAzBoost running on port ${PORT}`);
});
