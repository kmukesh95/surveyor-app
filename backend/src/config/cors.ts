import { CorsOptions } from 'cors';
import { ENV } from './env';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    const allowedOrigins = ENV.CORS_ORIGIN.split(',').map((o) => o.trim());
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*') || ENV.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy restricts access from origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Encrypted-Payload'],
};
