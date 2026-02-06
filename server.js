const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const INDEX_FILE = path.join(PUBLIC_DIR, 'index.html');

// Auto-create public folder if missing
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);

// Auto-create default index.html if missing
if (!fs.existsSync(INDEX_FILE)) {
  fs.writeFileSync(INDEX_FILE, `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Ash$Az.Boost Dashboard</title>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
      <h1>Welcome to Ash$Az.Boost!</h1>
      <p>Your server is running successfully.</p>

      <table>
        <tr><th>ID</th><th>Name</th><th>Status</th></tr>
        <tr><td>1</td><td>Test User</td><td>Active</td></tr>
        <tr><td>2</td><td>Another User</td><td>Inactive</td></tr>
      </table>
    </body>
    </html>
  `);
}

// Serve static files
app.use(express.static(PUBLIC_DIR));

// SPA fallback
app.get('*', (req, res) => res.sendFile(INDEX_FILE));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
