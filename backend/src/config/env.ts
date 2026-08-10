import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/surveyordb?schema=public',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'surveyor_access_token_secret_key_2026_super_secure',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'surveyor_refresh_token_secret_key_2026_super_secure',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  PAYLOAD_ENCRYPTION_KEY: process.env.PAYLOAD_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef',
  ENABLE_PAYLOAD_ENCRYPTION: process.env.ENABLE_PAYLOAD_ENCRYPTION === 'true',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
