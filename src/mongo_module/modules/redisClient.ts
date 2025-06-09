import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  },
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

let isConnected = false;

export const connectRedis = async () => {
  if (!isConnected) {
    try {
      await redisClient.connect();
      isConnected = true;
      console.log('Redis connected successfully');
    } catch (err) {
      console.error('Redis connection failed:', err);
    }
  }
};

export default redisClient;
