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

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 500,
        error: "Secret key is missing",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should proceed if secret key exists", async () => {
      process.env.JOSE_SECRET = "test-secret";
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      // Mock jose.jwtDecrypt to throw error (will be caught)
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

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 401,
        error: "Invalid or missing token",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if authorization header does not start with Bearer", async () => {
      mockRequest.header = jest.fn().mockReturnValue("Invalid token");

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 401,
        error: "Invalid or missing token",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should extract token from Bearer header", async () => {
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token-123");

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
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      const mockDecryptedToken = {
        payload: {},
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 400,
        error: "Invalid token payload: Missing jwtSignedToken",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should proceed if jwtSignedToken exists in payload", async () => {
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

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
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token-123",
        },
      };

      const mockVerifiedToken = {
        payload: {
          exp: Math.floor(Date.now() / 1000) + 3600, // Future expiration
          virtual_id: "virtual123",
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);
      (virtualId.findOne as jest.Mock).mockResolvedValue({
        virtualId: "virtual123",
        token: "test-token", // Matches authHeader.split(' ')[1]
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
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

      const mockVerifiedToken = {
        payload: {
          exp: Math.floor(Date.now() / 1000) - 3600, // Past expiration
          virtual_id: "virtual123",
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 401,
        error: "Token expired",
        message: "Token expired",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if exp is missing", async () => {
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

      const mockVerifiedToken = {
        payload: {
          virtual_id: "virtual123",
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 401,
        error: "Token expired",
        message: "Token expired",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should proceed if token is not expired", async () => {
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

      const mockVerifiedToken = {
        payload: {
          exp: Math.floor(Date.now() / 1000) + 3600, // Future expiration
          virtual_id: "virtual123",
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);
      // Token stored in DB should match the extracted token (without "Bearer ")
      (virtualId.findOne as jest.Mock).mockResolvedValue({
        virtualId: "virtual123",
        token: "test-token", // Matches authHeader.split(' ')[1]
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
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

      const mockVerifiedToken = {
        payload: {
          exp: Math.floor(Date.now() / 1000) + 3600,
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 400,
        error: "Invalid token payload: Missing virtual_id",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should check token status in database", async () => {
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

      const mockVerifiedToken = {
        payload: {
          exp: Math.floor(Date.now() / 1000) + 3600,
          virtual_id: "virtual123",
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);
      (virtualId.findOne as jest.Mock).mockResolvedValue({
        virtualId: "virtual123",
        token: "test-token", // Matches authHeader.split(' ')[1]
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
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

      const mockVerifiedToken = {
        payload: {
          exp: Math.floor(Date.now() / 1000) + 3600,
          virtual_id: "virtual123",
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);
      (virtualId.findOne as jest.Mock).mockResolvedValue(null);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 401,
        error: "User logged out!",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token is null", async () => {
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

      const mockVerifiedToken = {
        payload: {
          exp: Math.floor(Date.now() / 1000) + 3600,
          virtual_id: "virtual123",
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);
      (virtualId.findOne as jest.Mock).mockResolvedValue({
        virtualId: "virtual123",
        token: null,
      });

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 401,
        error: "User logged out!",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token does not match", async () => {
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

      const mockVerifiedToken = {
        payload: {
          exp: Math.floor(Date.now() / 1000) + 3600,
          virtual_id: "virtual123",
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);
      (virtualId.findOne as jest.Mock).mockResolvedValue({
        virtualId: "virtual123",
        token: "Bearer different-token",
      });

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 401,
        error: "User logged out!",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next() if token is valid", async () => {
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

      const mockVerifiedToken = {
        payload: {
          exp: Math.floor(Date.now() / 1000) + 3600,
          virtual_id: "virtual123",
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);
      // Token stored in DB should match the extracted token (without "Bearer ")
      (virtualId.findOne as jest.Mock).mockResolvedValue({
        virtualId: "virtual123",
        token: "test-token", // Matches authHeader.split(' ')[1]
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
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      // Create a mock error that matches instanceof check
      const expiredError = Object.create(jose.errors.JWTExpired.prototype);
      expiredError.message = "Token expired";

      (jose.jwtDecrypt as jest.Mock).mockRejectedValue(expiredError);

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 401,
        error: "Token expired",
        message: "Token expired",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 for JWSSignatureVerificationFailed error", async () => {
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      // Create a mock error that matches instanceof check
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

      expect(statusSpy).toHaveBeenCalledWith(401);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 401,
        error: "Invalid token signature",
        message: "Invalid token signature",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 for other errors", async () => {
      mockRequest.header = jest.fn().mockReturnValue("Bearer test-token");

      (jose.jwtDecrypt as jest.Mock).mockRejectedValue(
        new Error("Unknown error")
      );

      await verifyToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        status: 400,
        error: "Invalid token",
        message: "Invalid token",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

