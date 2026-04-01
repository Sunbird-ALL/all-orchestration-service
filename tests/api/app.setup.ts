/**
 * Test App Setup for API Testing
 * This file creates Express app instances for API integration tests
 */

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import sqlRouter from '../../src/sql_module';
import mongoDbRouter from '../../src/mongo_module/modules';

// Mock database connections to prevent actual connections during tests
jest.mock('../../src/sql_module/config/data.config', () => ({
  myDataSource: {
    initialize: jest.fn().mockResolvedValue(undefined),
    getRepository: jest.fn(),
  },
}));

jest.mock('mongoose', () => {
  const mockSchema = jest.fn().mockImplementation(() => ({
    index: jest.fn(),
    pre: jest.fn(),
    post: jest.fn(),
  }));
  
  return {
    default: {
      connect: jest.fn().mockResolvedValue(undefined),
      set: jest.fn(),
      Schema: mockSchema,
      model: jest.fn(),
      connection: {
        on: jest.fn(),
      },
    },
    Schema: mockSchema,
    connect: jest.fn().mockResolvedValue(undefined),
    set: jest.fn(),
    model: jest.fn(),
  };
});

/**
 * Create Express app for API testing
 * This creates a test app without cluster mode
 */
export function createTestApp(databaseType: 'mysql' | 'mongodb' = 'mysql') {
  const app = express();

  // Middleware
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ limit: '5mb', extended: true }));

  // Error handler for JSON parsing
  app.use((err: any, req: any, res: any, next: () => void) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({
        message: 'Invalid JSON format in request body'
      });
    }
    next();
  });

  // CORS - Configure for testing environment
  // Note: Using specific test origins instead of '*' for security
  // In production, this should be configured via environment variables
  const testOrigins = process.env.TEST_CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3009'];
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests) in test environment
      if (!origin || testOrigins.includes(origin) || process.env.NODE_ENV === 'test') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  // Compression
  app.use(compression());

  // Routes based on database type
  if (databaseType === 'mysql') {
    app.use('/api', sqlRouter);
  } else {
    app.use('/api', mongoDbRouter);
  }

  // Health check endpoint
  app.get('/ping', (req, res) => {
    res.status(200).json({
      status: true,
      message: 'App is working',
    });
  });

  return app;
}

