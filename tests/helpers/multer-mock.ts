/**
 * Multer Mock Utility
 * Centralized multer mocking for test files
 */

/**
 * Type for multer callback function
 */
type MulterCallback = (
  req: unknown,
  res: unknown,
  cb: (err: Error | null) => void
) => void;

const getMockMulterCallback = (): MulterCallback => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalCallback = (global as any).__mockMulterCallback;
  return (
    globalCallback ||
    ((req: unknown, res: unknown, cb: (err: Error | null) => void) => cb(null))
  );
};

/**
 * Note: This function should be called at module level, not inside tests
 * jest.mock() calls are hoisted and must be at the top level
 */
export function setupMulterMock(): void {
  jest.mock("multer", () => {
    const mockMulter = jest.fn(() => ({
      single: jest.fn(() => {
        return (
          req: unknown,
          res: unknown,
          callback: (err: Error | null) => void
        ) => {
          const cb = getMockMulterCallback();
          try {
            cb(req, res, callback);
          } catch (err) {
            callback(err instanceof Error ? err : new Error(String(err)));
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
  });
}

export function setMulterCallback(callback: MulterCallback): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).__mockMulterCallback = callback;
}

export function getMulterCallback(): MulterCallback {
  return getMockMulterCallback();
}
