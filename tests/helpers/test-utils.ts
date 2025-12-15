/**
 * Test Utilities
 * Common helpers and factories for reducing test code duplication
 */

import { Request, Response } from "express";
import { Readable } from "stream";
import HttpResponse from "../../src/common/http.Response/http.Response";

/**
 * Creates a mock Express Request object
 */
export function createMockRequest(
  overrides: Partial<Request> = {}
): Partial<Request> {
  return {
    query: {},
    body: {},
    params: {},
    file: undefined,
    header: jest.fn(),
    ...overrides,
  };
}

/**
 * Creates a mock Express Response object with spies
 */
export function createMockResponse(): {
  mockResponse: Partial<Response>;
  statusSpy: jest.Mock;
  sendSpy: jest.Mock;
  jsonSpy: jest.Mock;
  setHeaderSpy: jest.Mock;
} {
  const sendSpy = jest.fn();
  const jsonSpy = jest.fn();
  const setHeaderSpy = jest.fn();
  const statusSpy = jest.fn().mockReturnValue({
    send: sendSpy,
    json: jsonSpy,
    setHeader: setHeaderSpy,
  });

  const mockResponse: Partial<Response> = {
    status: statusSpy,
    send: sendSpy,
    json: jsonSpy,
    setHeader: setHeaderSpy,
    locals: {},
  };

  return {
    mockResponse,
    statusSpy,
    sendSpy,
    jsonSpy,
    setHeaderSpy,
  };
}

/**
 * Creates a mock NextFunction
 */
export function createMockNext(): jest.Mock {
  return jest.fn();
}

/**
 * Creates a mock file object for multer uploads
 */
export function createMockFile(
  options: {
    buffer?: Buffer;
    mimetype?: string;
    originalname?: string;
    fieldname?: string;
    size?: number;
  } = {}
): Express.Multer.File {
  return {
    buffer: options.buffer || Buffer.from("test"),
    fieldname: options.fieldname || "file",
    originalname: options.originalname || "test.xlsx",
    encoding: "7bit",
    mimetype:
      options.mimetype ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: options.size || 100,
    destination: "",
    filename: "",
    path: "",
    stream: new Readable(),
  } as Express.Multer.File;
}

/**
 * Creates a mock Excel file object
 */
export function createMockExcelFile(buffer?: Buffer): Express.Multer.File {
  return createMockFile({
    buffer: buffer || Buffer.from("test"),
    mimetype:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    originalname: "test.xlsx",
    fieldname: "excelFile",
  });
}

/**
 * Creates a mock CSV file object
 */
export function createMockCsvFile(buffer?: Buffer): Express.Multer.File {
  return createMockFile({
    buffer: buffer || Buffer.from("username\ntestuser"),
    mimetype: "text/csv",
    originalname: "test.csv",
    fieldname: "csvFile",
  });
}

/**
 * Type for multer callback function
 */
type MulterCallback = (
  req: unknown,
  res: unknown,
  cb: (err: Error | null) => void
) => void;

/**
 * Sets up multer mock callback
 */
export function setupMulterMock(callback?: MulterCallback): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).__mockMulterCallback =
    callback ||
    ((req: unknown, res: unknown, cb: (err: Error | null) => void) => {
      cb(null);
    });
}

/**
 * Gets the current multer mock callback
 */
export function getMulterMockCallback(): MulterCallback {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    (global as any).__mockMulterCallback ||
    ((req: unknown, res: unknown, cb: (err: Error | null) => void) => {
      cb(null);
    })
  );
}

/**
 * Creates a complete multer mock for jest.mock() usage
 * This provides a consistent multer mock implementation across all test files
 * 
 * @param options - Configuration options for the multer mock
 * @returns A mock implementation for jest.mock('multer')
 * 
 * @example
 * jest.mock('multer', () => createMulterMock());
 */
export function createMulterMock(options: {
  syncCallback?: boolean;
  validateCallback?: boolean;
} = {}) {
  const { syncCallback = true, validateCallback = true } = options;

  const getMockMulterCallback = () =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).__mockMulterCallback ||
    ((req: any, res: any, cb: (err: any) => void) => {
      cb(null);
    });

  const mockMulter = jest.fn(() => ({
    single: jest.fn((fieldName: string) => {
      return (req: any, res: any, callback: (err: any) => void) => {
        const cb = getMockMulterCallback();
        
        if (validateCallback && typeof callback !== "function") {
          throw new TypeError("Callback is not a function");
        }
        
        try {
          if (syncCallback) {
            cb(req, res, callback);
          } else {
            // For async testing scenarios
            setImmediate(() => cb(req, res, callback));
          }
        } catch (err) {
          callback(err instanceof Error ? err : new TypeError(String(err)));
        }
      };
    }),
  }));
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mockMulter as any).memoryStorage = jest.fn(() => ({}));
  
  return {
    __esModule: true,
    default: mockMulter,
  };
}

/**
 * Creates a mock workbook for XLSX testing
 */
export function createMockWorkbook(sheetData: unknown[] = []): {
  SheetNames: string[];
  Sheets: Record<string, unknown>;
} {
  // Return a proper workbook structure that XLSX.utils.sheet_to_json can work with
  return {
    SheetNames: ["Sheet1"],
    Sheets: {
      Sheet1: {
        "!ref": "A1:B1", // Required for sheet_to_json to work
      },
    },
  };
}

/**
 * Common test patterns for validation failures
 */
export function expectValidationError(
  statusSpy: jest.Mock,
  sendSpy: jest.Mock,
  expectedMessage?: string
): void {
  expect(statusSpy).toHaveBeenCalledWith(400);
  if (expectedMessage) {
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expectedMessage,
      })
    );
  }
}

/**
 * Common test patterns for service errors
 */
export function expectServiceError(
  statusSpy: jest.Mock,
  sendSpy: jest.Mock,
  expectedStatus: number = 400
): void {
  expect(statusSpy).toHaveBeenCalledWith(expectedStatus);
}

/**
 * Common test patterns for successful responses
 */
export function expectSuccessResponse(
  statusSpy: jest.Mock,
  sendSpy: jest.Mock,
  expectedStatus: number = 200,
  expectedMessage?: string
): void {
  expect(statusSpy).toHaveBeenCalledWith(expectedStatus);
  if (expectedMessage) {
    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expectedMessage,
      })
    );
  }
}

/**
 * Waits for async operations to complete in tests
 */
export function waitForAsync(ms: number = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates a mock token verification setup for verifyToken tests
 */
export function createMockTokenSetup() {
  return {
    mockDecryptedToken: {
      payload: {
        jwtSignedToken: "signed-token",
      },
    },
    mockVerifiedToken: {
      payload: {
        exp: Math.floor(Date.now() / 1000) + 3600, // Future expiration
        virtual_id: "virtual123",
      },
    },
    expiredVerifiedToken: {
      payload: {
        exp: Math.floor(Date.now() / 1000) - 3600, // Past expiration
        virtual_id: "virtual123",
      },
    },
  };
}

/**
 * Resets all mocks and clears test state
 */
export function resetTestMocks(): void {
  jest.clearAllMocks();
  setupMulterMock();
}

/**
 * Creates a mock CrudOperations instance for service tests
 */
export function createMockCrudOperations(methods: string[] = []): any {
  const defaultMethods = [
    "getDocument",
    "save",
    "getAllDocuments",
    "deleteDocument",
    "cummumulativeScoreDocument",
    "lessonScoreDocuments",
    "getAlllessonMasterDocuments",
  ];

  const allMethods = [...new Set([...defaultMethods, ...methods])];
  const mockCrud: any = {};

  allMethods.forEach((method) => {
    mockCrud[method] = jest.fn();
  });

  return mockCrud;
}

/**
 * Sets up common service test mocks (CrudOperations and Model)
 */
export function setupServiceMocks(
  CrudOperationsClass: any,
  ModelClass: any,
  mockCrudOperations: any,
  mockInstance: any = {}
): void {
  (
    CrudOperationsClass as jest.MockedClass<typeof CrudOperationsClass>
  ).mockImplementation(() => mockCrudOperations);
  (ModelClass as jest.MockedClass<typeof ModelClass>).mockImplementation(
    () => mockInstance
  );
}

/**
 * Common error test helper for service callback tests
 */
export function expectServiceCallbackError(
  mockNext: jest.Mock,
  expectedError: Error | string,
  expectedMessage?: string
): void {
  if (expectedMessage) {
    expect(mockNext).toHaveBeenCalledWith(expectedError, expectedMessage);
  } else {
    expect(mockNext).toHaveBeenCalledWith(expectedError);
  }
}

/**
 * Common success test helper for service callback tests
 */
export function expectServiceCallbackSuccess(
  mockNext: jest.Mock,
  expectedResult: any
): void {
  expect(mockNext).toHaveBeenCalledWith(null, expectedResult);
}

/**
 * Creates a mock service callback implementation for success cases
 */
export function createSuccessServiceCallback(result: any) {
  return (data: any, callback: CallableFunction) => {
    callback(null, result || { id: 1, ...data });
  };
}

/**
 * Creates a mock service callback implementation for error cases
 */
export function createErrorServiceCallback(
  errorMessage: string = "Database error"
) {
  return (data: any, callback: CallableFunction) => {
    callback(new Error(errorMessage), null);
  };
}

/**
 * Creates a mock service callback implementation that throws an exception
 */
export function createExceptionServiceCallback(
  errorMessage: string = "Unexpected error"
) {
  return () => {
    throw new Error(errorMessage);
  };
}

/**
 * Helper to test controller success response
 */
export function expectControllerSuccess(
  statusSpy: jest.Mock,
  sendSpy: jest.Mock,
  expectedStatus: number = 200
): void {
  expect(statusSpy).toHaveBeenCalledWith(expectedStatus);
  expect(sendSpy).toHaveBeenCalledWith(expect.any(HttpResponse));
}

/**
 * Helper to test controller error response
 */
export function expectControllerError(
  statusSpy: jest.Mock,
  expectedStatus: number = 400
): void {
  expect(statusSpy).toHaveBeenCalledWith(expectedStatus);
}
