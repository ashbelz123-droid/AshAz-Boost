require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const app = express();

/* --------------------
   Middleware
-------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* --------------------
   MongoDB (Mongoose)
-------------------- */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

/* --------------------
   Sessions (STABLE FIX)
-------------------- */
app.use(session({
  name: 'ashazboost.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
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
   Start Server (Render)
-------------------- */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
