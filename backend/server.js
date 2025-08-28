// server.js
import 'dotenv/config';
import app from './app.js';
import validateApiKeys from './config/apiValidation.js';
import chalk from 'chalk';
import { connectDB } from './config/db.js'; // <-- add

const PORT = process.env.PORT || 3000;

async function startServer() {
  const keysAreValid = await validateApiKeys();
  if (!keysAreValid) {
    console.error(chalk.red('Server cannot start due to missing API keys. Please check your .env file.'));
    process.exit(1);
  }

  await connectDB(); // <-- add

  app.listen(PORT, () => {
    console.log(chalk.green(`🚀 Server is running on http://localhost:${PORT}`));
  });
}

startServer();
