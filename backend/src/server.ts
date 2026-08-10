import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { ENV } from './config/env';
import { corsOptions } from './config/cors';
import { responseMiddleware } from './middleware/response';
import { requestDecryptionMiddleware } from './middleware/cryptoMiddleware';
import { globalErrorHandler } from './middleware/errorHandler';
import { checkDbConnection } from './db/prisma';
import { CacheService } from './redis/redisClient';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

import masterRoutes from './v1/routes/masterRoutes';
import authRoutes from './v1/routes/authRoutes';
import familyRoutes from './v1/routes/familyRoutes';
import documentRoutes from './v1/routes/documentRoutes';
import adminRoutes from './v1/routes/adminRoutes';
import beneficiaryRoutes from './v1/routes/beneficiaryRoutes';
import userLocationRoutes from './v1/routes/userLocationRoutes';

const app = express();

// Security Headers & CORS
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors(corsOptions));
app.use(compression());

// Body Parsers & Payload Size Limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom Response & Encryption Middlewares
app.use(responseMiddleware);
app.use(requestDecryptionMiddleware);

// Rate Limiting (100 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    timestamp: new Date().toISOString(),
  },
});
app.use('/api/', apiLimiter);

import fs from 'fs';

// Serve static uploaded files with smart recursive subfolder search & cross-origin CORP headers
const uploadsBase = path.join(__dirname, '../uploads');
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(uploadsBase)
);

// Smart file resolution fallback for uploaded document media files
app.get(['/uploads/*', '/:filename'], (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  const reqPath = req.path;
  const filename = path.basename(reqPath);

  if (!filename || filename.startsWith('api') || filename.startsWith('health') || filename.startsWith('api-docs') || !filename.includes('.')) {
    return next();
  }

  const subdirs = ['', 'documents', 'identity_proof', 'profile_photo', 'qualification', 'ration_card', 'voter_id'];
  for (const dir of subdirs) {
    const fullPath = path.join(uploadsBase, dir, filename);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return res.sendFile(fullPath);
    }
  }

  next();
});

// Mount Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount API v1 Routes
app.use('/api/v1/master', masterRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/beneficiary', beneficiaryRoutes);
app.use('/api/v1/family-members', familyRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/user-locations', userLocationRoutes);

// Health Check Endpoint (Version 1)
app.get('/api/v1/health', async (req, res) => {
  const dbConnected = await checkDbConnection();
  return res.sendSuccess('System Health Check OK', {
    version: '1.0.0',
    environment: ENV.NODE_ENV,
    postgresConnected: dbConnected,
    redisActive: CacheService.isRedisActive(),
  });
});

// Global Error Handler
app.use(globalErrorHandler);

const startServer = async () => {
  await checkDbConnection();

  app.listen(ENV.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Surveyor Server v1.0.0 running on http://localhost:${ENV.PORT}`);
    console.log(`📊 Health Check: http://localhost:${ENV.PORT}/api/v1/health`);
    console.log(`=======================================================`);
  });
};

startServer();
