const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

/* --------------------
   Basic middleware
-------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* --------------------
   MongoDB Connection
-------------------- */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });

/* --------------------
   Sessions (FIXED)
-------------------- */
app.use(session({
  name: 'ashazboost.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: mongoose.connection.getClient(), // ✅ THIS FIXES THE ERROR
    dbName: 'ashazboost',
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false
  }
}));

/* --------------------
   Routes
-------------------- */
app.get('/', (req, res) => {
  res.send('🚀 AshAzBoost is LIVE');
});

app.get('/dashboard', (req, res) => {
  res.send(`
    <h1>AshAzBoost Dashboard</h1>
    <ul>
      <li>Users: 1248</li>
      <li>Orders: 312</li>
      <li>Revenue: $4,820</li>
    </ul>
  `);
});

/* --------------------
   Start server (RENDER)
-------------------- */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
