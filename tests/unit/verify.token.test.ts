import { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import { createHash } from "crypto";
import verifyToken from "../../src/mongo_module/middlewares/verify.token";
import virtualId from "../../src/mongo_module/models/user";

// Mock dependencies
jest.mock("jose");
jest.mock("../../src/mongo_module/models/user", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
  },
}));

// Helper functions to reduce duplication
const createMockDecryptedToken = (jwtSignedToken: string = "signed-token") => ({
  payload: { jwtSignedToken },
});

const createMockVerifiedToken = (
  virtualId: string = "virtual123",
  exp?: number
) => ({
  payload: {
    exp: exp || Math.floor(Date.now() / 1000) + 3600, // Future expiration by default
    virtual_id: virtualId,
  },
});

const createMockVerifiedTokenWithoutExp = (
  virtualId: string = "virtual123"
) => ({
  payload: { virtual_id: virtualId },
});

const setupBearerToken = (token: string = "test-token") => {
  return `Bearer ${token}`;
};

const setupMocks = (
  decryptedToken: any,
  verifiedToken: any,
  dbUser: any = null
) => {
  (jose.jwtDecrypt as jest.Mock).mockResolvedValue(decryptedToken);
  (jose.jwtVerify as jest.Mock).mockResolvedValue(verifiedToken);
  if (dbUser !== null) {
    (virtualId.findOne as jest.Mock).mockResolvedValue(dbUser);
  }
};

const expectErrorResponse = (
  statusSpy: jest.Mock,
  jsonSpy: jest.Mock,
  status: number,
  error: string,
  message?: string
) => {
  expect(statusSpy).toHaveBeenCalledWith(status);
  const expectedResponse: any = { status, error };
  if (message) {
    expectedResponse.message = message;
  }
  expect(jsonSpy).toHaveBeenCalledWith(expectedResponse);
};

describe("verifyToken Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusSpy: jest.Mock;
  let jsonSpy: jest.Mock;

  beforeEach(() => {
    // Reset environment variables
    process.env.JOSE_SECRET = "test-secret-key";
    process.env.JWT_SIGNIN_PRIVATE_KEY = "test-signin-key";

    // Setup mocks
    mockRequest = {
      header: jest.fn(),
    };

    jsonSpy = jest.fn().mockReturnThis();
    statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

    mockResponse = {
      status: statusSpy,
      json: jsonSpy,
      locals: {},
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Secret Key Validation", () => {
    it("should return 500 if secret key is missing", async () => {
      delete process.env.JOSE_SECRET;

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(statusSpy, jsonSpy, 500, "Secret key is missing");
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should proceed if secret key exists", async () => {
      process.env.JOSE_SECRET = "test-secret";
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      (jose.jwtDecrypt as jest.Mock).mockRejectedValue(
        new Error("Invalid token")
      );

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jose.jwtDecrypt).toHaveBeenCalled();
    });
  });

  describe("Authorization Header Validation", () => {
    it("should return 401 if authorization header is missing", async () => {
      mockRequest.header = jest.fn().mockReturnValue(undefined);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(statusSpy, jsonSpy, 401, "Invalid or missing token");
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if authorization header does not start with Bearer", async () => {
      mockRequest.header = jest.fn().mockReturnValue("Invalid token");

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(statusSpy, jsonSpy, 401, "Invalid or missing token");
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should extract token from Bearer header", async () => {
      mockRequest.header = jest
        .fn()
        .mockReturnValue(setupBearerToken("test-token-123"));

      // Mock jose.jwtDecrypt to throw error
      (jose.jwtDecrypt as jest.Mock).mockRejectedValue(
        new Error("Invalid token")
      );

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jose.jwtDecrypt).toHaveBeenCalledWith(
        "test-token-123",
        expect.any(Buffer)
      );
    });
  });

  describe("Token Decryption", () => {
    it("should return 400 if jwtSignedToken is missing in payload", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const mockDecryptedToken = { payload: {} };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(
        statusSpy,
        jsonSpy,
        400,
        "Invalid token payload: Missing jwtSignedToken"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should proceed if jwtSignedToken exists in payload", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const mockDecryptedToken = createMockDecryptedToken();

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockRejectedValue(
        new Error("Verification failed")
      );

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jose.jwtVerify).toHaveBeenCalled();
    });
  });

  describe("JWT Verification", () => {
    it("should verify the signed JWT token", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const mockDecryptedToken = createMockDecryptedToken("signed-token-123");
      const mockVerifiedToken = createMockVerifiedToken();

      setupMocks(mockDecryptedToken, mockVerifiedToken, {
        virtualId: "virtual123",
        token: "test-token",
      });

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jose.jwtVerify).toHaveBeenCalledWith(
        "signed-token-123",
        expect.any(Uint8Array)
      );
    });
  });

  describe("Token Expiration Check", () => {
    it("should return 401 if token is expired", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const mockDecryptedToken = createMockDecryptedToken();
      const mockVerifiedToken = createMockVerifiedToken(
        "virtual123",
        Math.floor(Date.now() / 1000) - 3600
      );

      setupMocks(mockDecryptedToken, mockVerifiedToken);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(
        statusSpy,
        jsonSpy,
        401,
        "Token expired",
        "Token expired"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if exp is missing", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const mockDecryptedToken = createMockDecryptedToken();
      const mockVerifiedToken = createMockVerifiedTokenWithoutExp();

      setupMocks(mockDecryptedToken, mockVerifiedToken);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(
        statusSpy,
        jsonSpy,
        401,
        "Token expired",
        "Token expired"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should proceed if token is not expired", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const mockDecryptedToken = createMockDecryptedToken();
      const mockVerifiedToken = createMockVerifiedToken();

      setupMocks(mockDecryptedToken, mockVerifiedToken, {
        virtualId: "virtual123",
        token: "test-token",
      });

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe("Virtual ID Validation", () => {
    it("should return 400 if virtual_id is missing", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const mockDecryptedToken = createMockDecryptedToken();
      const mockVerifiedToken = {
        payload: { exp: Math.floor(Date.now() / 1000) + 3600 },
      };

      setupMocks(mockDecryptedToken, mockVerifiedToken);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(
        statusSpy,
        jsonSpy,
        400,
        "Invalid token payload: Missing virtual_id"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should check token status in database", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const mockDecryptedToken = createMockDecryptedToken();
      const mockVerifiedToken = createMockVerifiedToken();

      setupMocks(mockDecryptedToken, mockVerifiedToken, {
        virtualId: "virtual123",
        token: "test-token",
      });

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(virtualId.findOne).toHaveBeenCalledWith({
        virtualId: "virtual123",
      });
    });
  });

  describe("Token Status Check", () => {
    it("should return 401 if user not found", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const mockDecryptedToken = createMockDecryptedToken();
      const mockVerifiedToken = createMockVerifiedToken();

      setupMocks(mockDecryptedToken, mockVerifiedToken, null);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(statusSpy, jsonSpy, 401, "User logged out!");
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token is null", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const mockDecryptedToken = createMockDecryptedToken();
      const mockVerifiedToken = createMockVerifiedToken();

      setupMocks(mockDecryptedToken, mockVerifiedToken, {
        virtualId: "virtual123",
        token: null,
      });

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(statusSpy, jsonSpy, 401, "User logged out!");
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token does not match", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const mockDecryptedToken = createMockDecryptedToken();
      const mockVerifiedToken = createMockVerifiedToken();

      setupMocks(mockDecryptedToken, mockVerifiedToken, {
        virtualId: "virtual123",
        token: "Bearer different-token",
      });

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(statusSpy, jsonSpy, 401, "User logged out!");
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next() if token is valid", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const mockDecryptedToken = createMockDecryptedToken();
      const mockVerifiedToken = createMockVerifiedToken();

      setupMocks(mockDecryptedToken, mockVerifiedToken, {
        virtualId: "virtual123",
        token: "test-token",
      });

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.locals?.virtual_id).toBe("virtual123");
      expect(mockNext).toHaveBeenCalled();
      expect(statusSpy).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should return 401 for JWTExpired error", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const expiredError = Object.create(jose.errors.JWTExpired.prototype);
      expiredError.message = "Token expired";

      (jose.jwtDecrypt as jest.Mock).mockRejectedValue(expiredError);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(
        statusSpy,
        jsonSpy,
        401,
        "Token expired",
        "Token expired"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 for JWSSignatureVerificationFailed error", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      const signatureError = Object.create(
        jose.errors.JWSSignatureVerificationFailed.prototype
      );
      signatureError.message = "Invalid signature";

      (jose.jwtDecrypt as jest.Mock).mockRejectedValue(signatureError);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(
        statusSpy,
        jsonSpy,
        401,
        "Invalid token signature",
        "Invalid token signature"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 for other errors", async () => {
      mockRequest.header = jest.fn().mockReturnValue(setupBearerToken());

      (jose.jwtDecrypt as jest.Mock).mockRejectedValue(
        new Error("Unknown error")
      );

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectErrorResponse(
        statusSpy,
        jsonSpy,
        400,
        "Invalid token",
        "Invalid token"
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
