# API Integration Tests

This directory contains API-level integration tests that test endpoints over HTTP using Supertest.

## What are API Tests?

API tests are integration tests that:
- Test actual HTTP endpoints
- Send real HTTP requests (GET, POST, PUT, DELETE)
- Test the full request/response cycle
- Verify status codes, response bodies, and headers
- Test middleware, routing, and error handling

## Setup

### Dependencies
- `supertest` - HTTP assertion library for testing Express apps
- `@types/supertest` - TypeScript types for supertest

### Installation
```bash
npm install
```

## Running API Tests

```bash
# Run all API tests
npm run test:api

# Run specific API test file
npm test -- tests/api/virtual_id.api.test.ts

# Run all tests including API tests
npm test
```

## Test Structure

### Test App Setup (`app.test.ts`)
Creates an Express app instance for testing without cluster mode:
- Configures middleware (CORS, compression, JSON parsing)
- Sets up routes based on database type
- Provides health check endpoint

### API Test Files
- `virtual_id.api.test.ts` - Tests Virtual ID endpoints
- `student.api.test.ts` - Tests Student registration/login endpoints
- `lesson.api.test.ts` - Tests Lesson endpoints

## Example Test

```typescript
import request from 'supertest';
import { createTestApp } from './app.test';

describe('My API Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp('mysql'); // or 'mongodb'
  });

  it('should return 200 on success', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'value' })
      .expect(200);

    expect(response.body).toHaveProperty('result');
  });
});
```

## Test Patterns

### Testing GET Requests
```typescript
const response = await request(app)
  .get('/api/resource/123')
  .query({ param: 'value' })
  .expect(200);
```

### Testing POST Requests
```typescript
const response = await request(app)
  .post('/api/resource')
  .send({ field: 'value' })
  .expect(201);
```

### Testing with Headers
```typescript
const response = await request(app)
  .get('/api/resource')
  .set('Authorization', 'Bearer token')
  .expect(200);
```

### Testing Error Responses
```typescript
const response = await request(app)
  .post('/api/resource')
  .send({})
  .expect(400);

expect(response.body).toHaveProperty('status', 400);
```

## Mocking Services

Since API tests test the full HTTP layer, you may need to mock:
- Database connections
- External services
- Service layer methods

Example:
```typescript
jest.mock('../../src/module/service', () => ({
  default: {
    method: jest.fn((data, callback) => {
      callback(null, { result: 'data' });
    }),
  },
}));
```

## Benefits of API Tests

1. **End-to-End Validation**: Tests the complete request/response cycle
2. **Real HTTP Testing**: Tests actual HTTP behavior, not just functions
3. **Middleware Testing**: Validates middleware execution
4. **Route Testing**: Ensures routes are correctly configured
5. **Integration**: Tests how components work together

## When to Use API Tests

- ✅ Testing complete API endpoints
- ✅ Validating request/response formats
- ✅ Testing authentication/authorization
- ✅ Testing error handling at API level
- ✅ Integration testing

## When NOT to Use API Tests

- ❌ Unit testing business logic (use unit tests)
- ❌ Testing database queries directly (use service tests)
- ❌ Testing utility functions (use unit tests)

## Best Practices

1. **Mock External Dependencies**: Don't connect to real databases in tests
2. **Test One Thing**: Each test should focus on one endpoint/behavior
3. **Use Descriptive Names**: Test names should clearly describe what's being tested
4. **Clean Up**: Reset mocks between tests
5. **Test Both Success and Failure**: Test happy paths and error scenarios

## Adding New API Tests

1. Create a new test file: `tests/api/module.api.test.ts`
2. Import `createTestApp` from `app.test.ts`
3. Mock necessary services
4. Write test cases for each endpoint
5. Run tests: `npm run test:api`

## Troubleshooting

### Tests failing with database connection errors
- Ensure services are properly mocked
- Check that database connections are mocked in test setup

### CORS errors
- Test app allows all origins by default
- Check if middleware is properly configured

### Timeout errors
- Increase Jest timeout if needed
- Check for async operations that aren't being awaited

