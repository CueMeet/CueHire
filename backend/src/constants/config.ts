import * as dotenv from 'dotenv';
dotenv.config();

export const NODE_ENV: string = process.env.NODE_ENV ?? 'development';
export const IS_PRODUCTION: boolean = NODE_ENV === 'production';

export const PORT = Number(process.env.PORT) || 8000;
export const ORIGIN = process.env.ORIGIN || 'http://localhost:3000';

export const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';
export const POSTGRES_DB = process.env.POSTGRES_DB || 'cue-calender';
export const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
export const POSTGRES_PORT = Number(process.env.POSTGRES_PORT) || 5432;

// Redis
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

// Google
export const GOOGLE_AUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
  scopes: [
    'openid',
    'profile',
    'email',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
  ],
};

// JWT
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || '';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || '';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3hr';
export const JWT_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// CueMeet
export const CUEMEET_BASE_URL = process.env.CUEMEET_BASE_URL || '';

// Google Generative AI
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
