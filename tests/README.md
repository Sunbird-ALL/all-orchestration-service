# Testing Guide

## Test Framework: Jest

This project uses **Jest** as the testing framework, which provides:
- Built-in TypeScript support via `ts-jest`
- Automatic mocking capabilities
- Code coverage reporting
- Watch mode for development

## Installation

Install dependencies:
```bash
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run tests in CI mode
```bash
npm run test:ci
```

## Test Structure

Tests are organized following the project's testing standards:

```
tests/
├── unit/                    # Unit tests for isolated components
│   ├── controllers/         # Controller unit tests
│   ├── services/           # Service unit tests
│   └── utilities/          # Utility function tests
├── integration/             # Integration tests
│   ├── api/                # API endpoint tests
│   └── database/           # Database integration tests
├── fixtures/               # Test data fixtures
├── helpers/                # Test helper utilities
└── setup.ts                # Global test setup
```

## Writing Tests

### Unit Test Example

```typescript
import { Request, Response } from 'express';
import MyController from '../../src/path/to/controller';

describe('MyController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  it('should handle successful request', async () => {
    // Arrange
    mockRequest.body = { data: 'test' };

    // Act
    await MyController.method(mockRequest as Request, mockResponse as Response);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });
});
```

## Coverage Requirements

- **Minimum 80% coverage** for all production code
- **100% coverage** for critical business logic and security components
- Coverage reports are generated in the `coverage/` directory

## Best Practices

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Test Isolation**: Each test should be independent
3. **Mock External Dependencies**: Mock database, external APIs, etc.
4. **Descriptive Test Names**: Use clear, descriptive test names
5. **Test Edge Cases**: Include error scenarios and boundary conditions
6. **Clean Up**: Use `beforeEach`/`afterEach` to reset mocks

## Mocking

### Mocking Services
```typescript
jest.mock('../../src/path/to/service');
```

### Mocking Database
```typescript
const mockRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
};
```

### Mocking Express Request/Response
```typescript
const mockRequest = {
  query: {},
  body: {},
  params: {},
} as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
} as unknown as Response;
```

