import { Pool, PoolClient } from 'pg';

// Database configuration from environment variables or defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mydb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: parseInt(process.env.DB_MAX_POOL_SIZE || '10'),
};

// Create a connection pool
let pool: Pool | null = null;

/**
 * Sleep utility function
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Test database connection
 */
const testConnection = async (client: PoolClient): Promise<boolean> => {
  try {
    await client.query('SELECT NOW()');
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Connect to PostgreSQL database with exponential backoff retry logic
 * @param maxRetries Maximum number of retry attempts (default: 10)
 * @param initialDelay Initial delay in milliseconds (default: 1000ms)
 * @returns Promise that resolves when connection is established
 */
export const connectDatabase = async (
  maxRetries: number = 10,
  initialDelay: number = 1000
): Promise<Pool> => {
  let attempt = 0;
  let delay = initialDelay;

  while (attempt < maxRetries) {
    try {
      console.log(`Attempting to connect to PostgreSQL (attempt ${attempt + 1}/${maxRetries})...`);
      
      // Create a new pool for this attempt
      const testPool = new Pool(dbConfig);
      
      // Test the connection
      const client = await testPool.connect();
      const isConnected = await testConnection(client);
      client.release();

      if (isConnected) {
        pool = testPool;
        console.log('✅ Successfully connected to PostgreSQL database!');
        console.log(`Database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
        return pool;
      }
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt + 1} failed:`, error instanceof Error ? error.message : error);
      
      // Clean up failed pool
      if (pool) {
        try {
          await pool.end();
        } catch (e) {
          // Ignore cleanup errors
        }
        pool = null;
      }
    }

    attempt++;

    if (attempt < maxRetries) {
      console.log(`⏳ Retrying in ${delay}ms...`);
      await sleep(delay);
      // Exponential backoff: increasing the delay for next attempt by 2^attempt
      delay *= 2**attempt;
    }
  }

  throw new Error(
    `Failed to connect to PostgreSQL after ${maxRetries} attempts. ` +
    `Please ensure the database is running and accessible at ${dbConfig.host}:${dbConfig.port}`
  );
};

/**
 * Get the database pool instance
 * @returns The database pool or null if not connected
 */
export const getPool = (): Pool | null => {
  return pool;
};

/**
 * Close the database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection closed.');
  }
};
