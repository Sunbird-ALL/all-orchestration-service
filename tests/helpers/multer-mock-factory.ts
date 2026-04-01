/**
 * Multer Mock Factory
 *
 * This file provides a reusable multer mock factory that can be used with jest.mock()
 * without running into hoisting issues.
 *
 * Usage:
 * ```typescript
 * jest.mock('multer', () => require('../helpers/multer-mock-factory').createMockMulter());
 * ```
 */

/**
 * Gets the mock multer callback from global state or returns a default
 * This is extracted to avoid duplication across mock factory functions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMockMulterCallback(): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__mockMulterCallback ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((req: any, res: any, cb: (err: any) => void) => {
      cb(null);
    })
  );
}

/**
 * Creates a mock multer instance for testing
 * This is a standalone factory that doesn't rely on imports from test-utils
 */
export function createMockMulter(
  options: {
    syncCallback?: boolean;
    validateCallback?: boolean;
  } = {}
) {
  const { syncCallback = true, validateCallback = true } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockMulter = jest.fn(() => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    single: jest.fn((fieldName: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * Simplified multer mock without validation (for simpler test scenarios)
 */
export function createSimpleMockMulter() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockMulter = jest.fn(() => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    single: jest.fn(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (req: any, res: any, callback: (err: any) => void) => {
        const cb = getMockMulterCallback();
        cb(req, res, callback);
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
