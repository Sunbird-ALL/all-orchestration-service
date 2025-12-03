// Global test setup file
// This runs before all tests

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_TYPE = 'mysql';
process.env.SQL_DB_TYPE = 'mysql';
process.env.SQL_PORT = '3306';

// Mock environment variables for testing
process.env.SQL_HOST = 'localhost';
process.env.SQL_USERNAME = 'test_user';
process.env.SQL_PASSWORD = 'test_password';
process.env.SQL_DATABASE_NAME = 'test_db';
process.env.JWT_SIGNIN_PRIVATE_KEY = 'test-secret-key';
process.env.JOSE_SECRET = 'test-jose-secret';
process.env.JWT_EXPIRATION = '1h';

// Increase timeout for async operations
jest.setTimeout(10000);

