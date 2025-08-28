// config/db.js
import mongoose from 'mongoose';
import chalk from 'chalk';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(chalk.red('❌ MONGODB_URI missing in .env'));
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(chalk.green('✅ MongoDB connected'));
  } catch (err) {
    console.error(chalk.red('❌ MongoDB connection error:'), err.message);
    process.exit(1);
  }
}
