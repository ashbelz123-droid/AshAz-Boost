const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

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

app.get('/', (req, res) => {
  res.send('🚀 AshAzBoost running!');
});

app.get('/dashboard', (req, res) => {
  res.send(`
    <h1>AshAzBoost Dashboard</h1>
    <p>Users: 1248</p>
    <p>Orders: 312</p>
    <p>Revenue: $4,820</p>
  `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 AshAzBoost running on port ${PORT}`);
});
