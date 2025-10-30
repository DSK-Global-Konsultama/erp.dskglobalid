// src/server.js
require('dotenv').config();
const app = require('./app');
const { checkConnection } = require('./config/db');

const PORT = Number(process.env.PORT || 3000);

(async () => {
  try {
    await checkConnection();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();
