import virtualIdService from "../../src/mongo_module/modules/virtual_id/virtual_id.service";
import virtualId from "../../src/mongo_module/models/user";
import * as jose from "jose";
import { createHash } from "crypto";
import HttpException from "../../src/common/http.Exception/http.Exception";

// Mock dependencies
const mockFindOne = jest.fn();
const mockUpdateOne = jest.fn();
const mockSave = jest.fn();

jest.mock("../../src/mongo_module/models/user", () => {
  const mockFindOneFn = jest.fn();
  const mockUpdateOneFn = jest.fn();
  const mockSaveFn = jest.fn();
  
  const MockModel: any = jest.fn().mockImplementation(() => ({
    save: mockSaveFn,
  }));
  MockModel.findOne = mockFindOneFn;
  MockModel.updateOne = mockUpdateOneFn;
  
  // Export the mock functions so we can use them in tests
  (MockModel as any).__mockFindOne = mockFindOneFn;
  (MockModel as any).__mockUpdateOne = mockUpdateOneFn;
  (MockModel as any).__mockSave = mockSaveFn;
  
  return {
    __esModule: true,
    default: MockModel,
  };
});

jest.mock("jose");
jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));

describe("virtualIdService (MongoDB)", () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockNext = jest.fn();
    process.env.JOSE_SECRET = "test-secret-key";
    process.env.JWT_SIGNIN_PRIVATE_KEY = "test-signin-key";
    process.env.JWT_EXPIRATION = "1h";
    
    // Reset all mocks
    mockFindOne.mockClear();
    mockUpdateOne.mockClear();
    mockSave.mockClear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("generateId", () => {
    it("should generate new virtual ID for new user", async () => {
      const username = "newuser";
      const mockToken = "encrypted-token-123";

      (virtualId.findOne as jest.Mock).mockResolvedValue(null);
      (jose.SignJWT as jest.Mock).mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue("signed-token"),
      }));
      (jose.EncryptJWT as jest.Mock).mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        encrypt: jest.fn().mockResolvedValue(mockToken),
      }));

      const mockSaveInstance = jest.fn().mockResolvedValue({});
      (virtualId as any).mockImplementation(() => ({
        save: mockSaveInstance,
      }));

      await virtualIdService.generateId(username, mockNext);

      expect(virtualId.findOne).toHaveBeenCalledWith({
        userName: "newuser",
      });
      expect(mockNext).toHaveBeenCalledWith(null, {
        token: mockToken,
      });
    });

    it("should return existing virtual ID for existing user", async () => {
      const username = "existinguser";
      const existingVirtualId = "1234567890";
      const mockToken = "encrypted-token-123";

      (virtualId.findOne as jest.Mock).mockResolvedValue({
        userName: "existinguser",
        virtualId: existingVirtualId,
      });
      (jose.SignJWT as jest.Mock).mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue("signed-token"),
      }));
      (jose.EncryptJWT as jest.Mock).mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        encrypt: jest.fn().mockResolvedValue(mockToken),
      }));
      (virtualId.updateOne as jest.Mock).mockResolvedValue({});

      await virtualIdService.generateId(username, mockNext);

      expect(virtualId.findOne).toHaveBeenCalledWith({
        userName: "existinguser",
      });
      expect(virtualId.updateOne).toHaveBeenCalledWith(
        { virtualId: existingVirtualId },
        {
          $set: {
            token: mockToken,
          },
        }
      );
      expect(mockNext).toHaveBeenCalledWith(null, {
        token: mockToken,
      });
    });

    it("should normalize username to lowercase and trim", async () => {
      const username = "  TestUser  ";
      const mockToken = "encrypted-token-123";

      (virtualId.findOne as jest.Mock).mockResolvedValue(null);
      (jose.SignJWT as jest.Mock).mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue("signed-token"),
      }));
      (jose.EncryptJWT as jest.Mock).mockImplementation(() => ({
        setProtectedHeader: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        encrypt: jest.fn().mockResolvedValue(mockToken),
      }));

      const mockSaveInstance = jest.fn().mockResolvedValue({});
      (virtualId as any).mockImplementation(() => ({
        save: mockSaveInstance,
      }));

      await virtualIdService.generateId(username, mockNext);

      expect(virtualId.findOne).toHaveBeenCalledWith({
        userName: "testuser",
      });
    });

    it("should handle errors", async () => {
      const username = "testuser";
      const error = new Error("Database error");

      (virtualId.findOne as jest.Mock).mockRejectedValue(error);

      await virtualIdService.generateId(username, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });

  describe("decodeToken", () => {
    it("should successfully decode token", async () => {
      const encryptedToken = "encrypted-token-123";
      const virtualId = "1234567890";

      const mockDecryptedPayload = {
        jwtSignedToken: "signed-token",
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue({
        payload: mockDecryptedPayload,
        protectedHeader: {},
      });

      const { jwtDecode } = require("jwt-decode");
      jwtDecode.mockReturnValue({ virtual_id: virtualId });

      const result = await virtualIdService.decodeToken(encryptedToken);

      expect(result.success).toBe(true);
      expect(result.virtual_id).toBe(virtualId);
    });

    it("should return error if JOSE_SECRET is missing", async () => {
      delete process.env.JOSE_SECRET;
      const encryptedToken = "encrypted-token-123";

      const result = await virtualIdService.decodeToken(encryptedToken);

      expect(result.success).toBe(false);
      expect(result.error).toContain("JOSE_SECRET");
    });

    it("should handle decoding errors", async () => {
      const encryptedToken = "invalid-token";
      const error = new Error("Invalid token format");

      (jose.jwtDecrypt as jest.Mock).mockRejectedValue(error);

      const result = await virtualIdService.decodeToken(encryptedToken);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("logout", () => {
    it("should successfully logout user", async () => {
      const token = "encrypted-token-123";
      const virtualID = "1234567890";

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

      const mockVerifiedToken = {
        payload: {
          virtual_id: virtualID,
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);
      (virtualId.findOne as jest.Mock).mockResolvedValue({
        virtualId: virtualID,
        token: token,
      });
      (virtualId.updateOne as jest.Mock).mockResolvedValue({});

      const result = await virtualIdService.logout(token);

      expect(result.success).toBe(true);
      expect(virtualId.updateOne).toHaveBeenCalledWith(
        { virtualId: virtualID },
        {
          $set: {
            token: null,
          },
        }
      );
    });

    it("should throw error if token is missing", async () => {
      const token = "";

      await expect(virtualIdService.logout(token)).rejects.toThrow(
        HttpException
      );
    });

    it("should throw error if JOSE_SECRET is missing", async () => {
      delete process.env.JOSE_SECRET;
      const token = "encrypted-token-123";

      await expect(virtualIdService.logout(token)).rejects.toThrow(
        HttpException
      );
    });

    it("should return success for expired token", async () => {
      const token = "encrypted-token-123";

      const expiredError = Object.create(jose.errors.JWTExpired.prototype);
      expiredError.message = "Token expired";

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue({
        payload: {
          jwtSignedToken: "signed-token",
        },
      });
      (jose.jwtVerify as jest.Mock).mockRejectedValue(expiredError);

      const result = await virtualIdService.logout(token);

      expect(result.success).toBe(true);
      expect(result.message).toContain("expired");
    });

    it("should throw error if user not found", async () => {
      const token = "encrypted-token-123";
      const virtualID = "1234567890";

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

      const mockVerifiedToken = {
        payload: {
          virtual_id: virtualID,
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);
      (virtualId.findOne as jest.Mock).mockResolvedValue(null);

      await expect(virtualIdService.logout(token)).rejects.toThrow(
        HttpException
      );
    });

    it("should throw error if token does not match", async () => {
      const token = "encrypted-token-123";
      const virtualID = "1234567890";

      const mockDecryptedToken = {
        payload: {
          jwtSignedToken: "signed-token",
        },
      };

      const mockVerifiedToken = {
        payload: {
          virtual_id: virtualID,
        },
      };

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue(mockDecryptedToken);
      (jose.jwtVerify as jest.Mock).mockResolvedValue(mockVerifiedToken);
      (virtualId.findOne as jest.Mock).mockResolvedValue({
        virtualId: virtualID,
        token: "different-token",
      });

      await expect(virtualIdService.logout(token)).rejects.toThrow(
        HttpException
      );
    });

    it("should handle JOSEError", async () => {
      const token = "encrypted-token-123";

      const joseError = Object.create(jose.errors.JOSEError.prototype);
      joseError.message = "JOSE error";

      (jose.jwtDecrypt as jest.Mock).mockResolvedValue({
        payload: {
          jwtSignedToken: "signed-token",
        },
      });
      (jose.jwtVerify as jest.Mock).mockRejectedValue(joseError);

      await expect(virtualIdService.logout(token)).rejects.toThrow(
        HttpException
      );
    });
  });

  describe("tokenStatus", () => {
    it("should return token status for existing user", async () => {
      const user_id = "1234567890";
      const mockUser = {
        virtualId: user_id,
        token: "test-token-123",
      };

      (virtualId.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await virtualIdService.tokenStatus(user_id);

      expect(virtualId.findOne).toHaveBeenCalledWith({
        virtualId: user_id,
      });
      expect(result).toEqual({
        token: "test-token-123",
      });
    });

    it("should return null token for non-existing user", async () => {
      const user_id = "nonexistent";

      (virtualId.findOne as jest.Mock).mockResolvedValue(null);

      const result = await virtualIdService.tokenStatus(user_id);

      expect(result).toEqual({
        token: undefined,
      });
    });
  });
});

