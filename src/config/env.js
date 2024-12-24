import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
console.log('Environment Variables Loaded:', process.env);
export const config = {
  port: process.env.PORT || 3000,
  openaiApiKey: process.env.OPENAI_API_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
console.log('Loaded OpenAI API Key:', config);
// Validate required environment variables
const requiredEnvVars = ['OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}
