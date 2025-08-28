// config/apiValidation.js
import axios from 'axios';
import chalk from 'chalk'; // CHANGED: Switched to the correct default import for chalk.

async function validateApiKeys() {
    // CHANGED: Uses chalk.blue() instead of just blue()
    console.log(chalk.blue('--- Validating API Keys ---'));
    let allKeysValid = true;

    if (!process.env.SERPER_API_KEY) {
        // CHANGED: Uses chalk.red() instead of just red()
        console.error(chalk.red('❌ SERPER_API_KEY: Not found in .env'));
        allKeysValid = false;
    }

    if (!process.env.GEMINI_API_KEY) {
        // CHANGED: Uses chalk.red() instead of just red()
        console.error(chalk.red('❌ GEMINI_API_KEY: Not found in .env'));
        allKeysValid = false;
    }

    if (!process.env.MONGODB_URI) {
    console.error(chalk.red('❌ MONGODB_URI: Not found in .env'));
    allKeysValid = false;
    }

    if (!process.env.JWT_SECRET) {
    console.error(chalk.red('❌ JWT_SECRET: Not found in .env'));
    allKeysValid = false;
    }

    console.log(chalk.blue('-------------------------'));
    return allKeysValid;
}

export default validateApiKeys; // CHANGED: Switched from module.exports to the ES Module 'export default'.