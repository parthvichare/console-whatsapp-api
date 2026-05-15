import Redis from 'ioredis';

const redisConfig = {
  host: process.env.REDIS_HOST || 'redis', // docker-safe default
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD?.trim() ||  undefined,
  db: Number(process.env.REDIS_DB || 0),

  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
};


export const redisConnection = new Redis(redisConfig);

redisConnection.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisConnection.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

export default redisConfig;


