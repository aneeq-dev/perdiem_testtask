import dotenv from 'dotenv';
import path from 'path';

if (!process.env.DOTENV_LOADED) {
  const envPath = path.resolve(process.cwd(), '.env');
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.warn('⚠️  Warning: Could not load .env file:', result.error.message);
  } else if (result.parsed) {
    process.env.DOTENV_LOADED = 'true';
    console.log(`✅ Loaded ${Object.keys(result.parsed).length} environment variables from .env`);
  }
}

export {};

