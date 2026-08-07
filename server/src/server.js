import app from './app.js';
import connectDatabase from './config/database.js';

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
