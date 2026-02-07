const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

/* --------------------
   MongoDB ONLY
-------------------- */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });

/* --------------------
   Routes
-------------------- */
app.get('/', (req, res) => {
  res.send('🚀 AshAzBoost is LIVE');
});

app.get('/dashboard', (req, res) => {
  res.json({
    users: 1248,
    orders: 312,
    revenue: 4820
  });
});

/* --------------------
   Start Server (RENDER)
-------------------- */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
