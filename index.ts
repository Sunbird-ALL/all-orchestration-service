import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import cluster from 'cluster';
import os from 'os';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/swagger/swagger.config';
import sqlRouter, { sqlDatabaseConnection } from './src/sql_module';
import mongoDbRouter, { mongodbConnection } from './src/mongo_module/modules';
import HttpException from './src/common/http.Exception/http.Exception';
import mongoose from 'mongoose';
import {
  globalErrorHandler,
  handleErrorForResponse,
  notFoundHandler,
  requestIdMiddleware,
} from './src/common/middleware/api-error.middleware';
dotenv.config();

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    console.log('Starting a new worker');
    cluster.fork();
  });
} else {
  (async () => {
    
    const app = express();
    const PORT: number = parseInt(process.env.PORT || '3009');
    const HOST: string = '0.0.0.0';
    const dataBaseType: string = process.env.DATABASE_TYPE || '';
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    const appVersion =  process.env.APP_VERSION || 'All'

    app.use(requestIdMiddleware);

    app.use((_req, res, next) => {
      res.setHeader('x-app-version', appVersion);
      next();
    });

    // Increase request size limit
    app.use(express.json({ limit: '5mb' }));
    app.use(express.urlencoded({ limit: '5mb', extended: true }));

    app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (err instanceof SyntaxError && 'body' in err) {
        return handleErrorForResponse(
          res,
          req,
          new HttpException(400, 'Invalid JSON format in request body', {
            errorType: 'BadRequest',
            code: 'INVALID_JSON',
          }),
        );
      }
      next(err);
    });

    // Cors aalowd for the specific url
    app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            console.log("allowed origins", allowedOrigins)
            callback(new Error('Not allowed by CORS' + origin));
          }
        },
        credentials: true,
      }),
    );

    // compress the response
    app.use(compression());

    // Swagger API Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'All Orchestration Service API Docs'
    }));

    // Swagger JSON endpoint
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    try {
      if (dataBaseType.toLowerCase() === 'mysql') {
        await sqlDatabaseConnection();
        app.use('/api', sqlRouter);
      } else {
        await mongodbConnection();
        app.use('/api', mongoDbRouter);
      }
    } catch (dbError) {
      console.error('Database startup failed. Shutting down worker.', dbError);
      throw dbError;
    }

    // App testing
    app.get('/ping', (req, res) => {
      res.status(200).json({
        status: true,
        message: 'App is working',
      });
    });

    // Deep health check
    app.get('/health', (req, res) => {
      const mongoOk = dataBaseType.toLowerCase() !== 'mysql'
        ? mongoose.connection.readyState === 1
        : null;
      const allOk = mongoOk !== false;
      res.status(200).json({
        status: allOk ? 'ok' : 'degraded',
        services: {
          ...(mongoOk !== null && { mongodb: mongoOk }),
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });

    app.use(notFoundHandler);
    app.use(globalErrorHandler);

    app.listen(PORT, HOST, () => {
      console.log(`Worker ${process.pid} is running on port ${PORT}`);
    });
  })();

}
