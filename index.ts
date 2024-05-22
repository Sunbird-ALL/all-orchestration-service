import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import cluster from 'cluster';
import os from 'os';
import compression from 'compression'
import sqlRouter, { sqlDatabaseConnection } from './src/sql_module';
import mongoDbRouter, { mongodbConnection } from './src/mongo_module/modules';
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
  const app = express();
  const PORT: number = parseInt(process.env.PORT || '3009');
  const dataBaseType: string = process.env.DATABASE_TYPE || '';

  // Parsing the request data
  app.use(express.json());
  app.use(cors());

  // compress the responce
  app.use(compression())

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

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} is running on port ${PORT}`);
  });
}
