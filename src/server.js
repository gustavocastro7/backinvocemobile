require('dotenv').config();

const app = require('./app');
const { runMigrations } = require('./migrations/run');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await runMigrations();
    console.log('Migrations completed successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
