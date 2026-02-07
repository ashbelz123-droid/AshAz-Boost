const express = require('express');
const path = require('path');

const app = express();

// ✅ IMPORTANT: Render provides this port
const PORT = process.env.PORT || 10000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ✅ MUST listen on 0.0.0.0 for Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AshAzBoost running on port ${PORT}`);
});
