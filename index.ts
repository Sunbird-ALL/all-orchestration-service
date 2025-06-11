import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import cluster from 'cluster';
import os from 'os';
import compression from 'compression'
import sqlRouter, { sqlDatabaseConnection } from './src/sql_module';
import mongoDbRouter, { mongodbConnection } from './src/mongo_module/modules';
import { connectRedis } from './src/mongo_module/modules/redisClient';
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
    await connectRedis();

    const app = express();
    const PORT: number = parseInt(process.env.PORT || '3009');
    const HOST: string = '0.0.0.0';
    const dataBaseType: string = process.env.DATABASE_TYPE || '';
    const allowedOrigins = process.env.ALLOWED_ORIGINS || '';

    // Increase request size limit
    app.use(express.json({ limit: '5mb' }));
    app.use(express.urlencoded({ limit: '5mb', extended: true }));

    // Restrcit the improper json format
    app.use((err: any, req: any, res: any, next: () => void) => {
      if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json(
          {
            message: 'Invalid JSON format in request body'
          });
      }
      next();
    });

    // Cors aalowd for the specific url
    app.use(cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    }));

    // compress the response
    app.use(compression());

    if (dataBaseType.toLowerCase() === 'mysql') {
      sqlDatabaseConnection();
      app.use('/api', sqlRouter);
    } else {
      mongodbConnection();
      app.use('/api', mongoDbRouter);
    }

    // App testing
    app.get('/ping', (req, res) => {
      res.status(200).json({
        status: true,
        message: 'App is working',
      });
    });

    app.listen(PORT, HOST, () => {
      console.log(`Worker ${process.pid} is running on port ${PORT}`);
    });
  })();

}
