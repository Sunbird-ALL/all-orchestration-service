import { Request, Response } from "express";
import { Readable } from "stream";
import virtualIdController from "../../src/mongo_module/modules/virtual_id/virtual_id.controller";
import virtualIdService from "../../src/mongo_module/modules/virtual_id/virtual_id.service";
import { genarateVirtualIdValidationSchema } from "../../src/mongo_module/validates/virtual_id.validate";
import { logoutValidationSchema } from "../../src/mongo_module/validates/logoutValidation";
import HttpException from "../../src/common/http.Exception/http.Exception";
import HttpResponse from "../../src/common/http.Response/http.Response";
import * as XLSX from "xlsx";

// Mock dependencies
jest.mock("../../src/mongo_module/modules/virtual_id/virtual_id.service");
jest.mock("../../src/mongo_module/validates/virtual_id.validate");
jest.mock("../../src/mongo_module/validates/logoutValidation");
jest.mock("xlsx");

// Mock multer - use a getter function to access the callback dynamically
const getMockMulterCallback = () =>
  (global as any).__mockMulterCallback ||
  ((req: any, res: any, cb: (err: any) => void) => cb(null));

jest.mock("multer", () => {
  const mockMulter = jest.fn(() => ({
    single: jest.fn(() => {
      return (req: any, res: any, callback: (err: any) => void) => {
        // Get callback function dynamically
        const cb = getMockMulterCallback();
        // Execute callback synchronously - the callback itself is async
        // This ensures coverage collection can see the code execution
        try {
          const result = cb(req, res, callback);
          // If callback returns a promise, ensure it's handled
          if (result && typeof result.then === "function") {
            result.catch((err: any) => callback(err));
          }
        } catch (err) {
          callback(err);
        }
      };
    }),
  }));
  (mockMulter as any).memoryStorage = jest.fn(() => ({}));
  return {
    __esModule: true,
    default: mockMulter,
  };
});

describe("virtualIdController (MongoDB)", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let statusSpy: jest.Mock;
  let sendSpy: jest.Mock;
  let setHeaderSpy: jest.Mock;

  beforeEach(() => {
    mockNext = jest.fn();
    sendSpy = jest.fn();
    setHeaderSpy = jest.fn();
    statusSpy = jest.fn().mockReturnValue({
      send: sendSpy,
      setHeader: setHeaderSpy,
    });

    mockRequest = {
      query: {},
      body: {},
      file: undefined,
    };

    mockResponse = {
      status: statusSpy,
      send: sendSpy,
      setHeader: setHeaderSpy,
    };

    // Reset multer callback
    (global as any).__mockMulterCallback = (
      req: any,
      res: any,
      callback: (err: any) => void
    ) => {
      callback(null);
    };

    jest.clearAllMocks();
  });

  describe("genarateVirtualId", () => {
    it("should return 400 if validation fails", async () => {
      mockRequest.query = {};
      (genarateVirtualIdValidationSchema.validate as jest.Mock).mockReturnValue(
        {
          error: { message: "Username is required" },
        }
      );

      await virtualIdController.genarateVirtualId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Required fields are missing",
        })
      );
    });

    it("should successfully generate virtual ID", async () => {
      mockRequest.query = { username: "testuser" };
      (genarateVirtualIdValidationSchema.validate as jest.Mock).mockReturnValue(
        {
          error: null,
        }
      );

      const mockResult = { token: "encrypted-token-123" };
      (virtualIdService.generateId as jest.Mock).mockImplementation(
        (username: string, callback: CallableFunction) => {
          callback(null, mockResult);
        }
      );

      await virtualIdController.genarateVirtualId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(virtualIdService.generateId).toHaveBeenCalledWith(
        "testuser",
        expect.any(Function)
      );
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Token generated",
          result: mockResult,
        })
      );
    });

    it("should return 400 when service returns error", async () => {
      mockRequest.query = { username: "testuser" };
      (genarateVirtualIdValidationSchema.validate as jest.Mock).mockReturnValue(
        {
          error: null,
        }
      );

      const mockError = new Error("Database error");
      (virtualIdService.generateId as jest.Mock).mockImplementation(
        (username: string, callback: CallableFunction) => {
          callback(mockError, null);
        }
      );

      await virtualIdController.genarateVirtualId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith(expect.any(HttpException));
    });

    it("should handle exceptions", async () => {
      mockRequest.query = { username: "testuser" };
      (
        genarateVirtualIdValidationSchema.validate as jest.Mock
      ).mockImplementation(() => {
        throw new Error("Validation error");
      });

      await virtualIdController.genarateVirtualId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });

  describe("logout", () => {
    it("should return 400 if validation fails", async () => {
      mockRequest.body = {};
      (logoutValidationSchema.validate as jest.Mock).mockReturnValue({
        error: { message: "Token is required" },
      });

      await virtualIdController.logout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Token is required",
        })
      );
    });

    it("should successfully logout user", async () => {
      mockRequest.body = { token: "test-token" };
      (logoutValidationSchema.validate as jest.Mock).mockReturnValue({
        error: null,
      });

      (virtualIdService.logout as jest.Mock).mockResolvedValue({
        success: true,
        message: "Logout successful",
      });

      await virtualIdController.logout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(virtualIdService.logout).toHaveBeenCalledWith("test-token");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Logged out successfully",
        })
      );
    });

    it("should return 400 if logout fails", async () => {
      mockRequest.body = { token: "test-token" };
      (logoutValidationSchema.validate as jest.Mock).mockReturnValue({
        error: null,
      });

      (virtualIdService.logout as jest.Mock).mockResolvedValue({
        success: false,
      });

      await virtualIdController.logout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith(expect.any(HttpException));
    });

    it("should handle exceptions", async () => {
      mockRequest.body = { token: "test-token" };
      (logoutValidationSchema.validate as jest.Mock).mockReturnValue({
        error: null,
      });

      (virtualIdService.logout as jest.Mock).mockRejectedValue(
        new Error("Service error")
      );

      await virtualIdController.logout(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });

  describe("tokenStatus", () => {
    it("should return token status successfully", async () => {
      mockRequest.body = { user_id: "virtual123" };
      const mockResult = { token: "test-token-123" };

      (virtualIdService.tokenStatus as jest.Mock).mockResolvedValue(mockResult);

      await virtualIdController.tokenStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(virtualIdService.tokenStatus).toHaveBeenCalledWith("virtual123");
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "user status return",
          result: mockResult,
        })
      );
    });

    it("should return 400 if token status not found", async () => {
      mockRequest.body = { user_id: "virtual123" };

      (virtualIdService.tokenStatus as jest.Mock).mockResolvedValue(null);

      await virtualIdController.tokenStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith(expect.any(HttpException));
    });

    it("should handle exceptions", async () => {
      mockRequest.body = { user_id: "virtual123" };

      (virtualIdService.tokenStatus as jest.Mock).mockRejectedValue(
        new Error("Service error")
      );

      await virtualIdController.tokenStatus(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });

  describe("processExcelTokens", () => {
    // Note: processExcelTokens uses multer middleware which is complex to test in isolation
    // Full coverage would require integration tests with actual file uploads
    // These tests verify the method structure and basic error handling

    it("should be defined and callable", () => {
      expect(virtualIdController.processExcelTokens).toBeDefined();
      expect(typeof virtualIdController.processExcelTokens).toBe("function");
    });

    it("should handle multer callback errors", async () => {
      const mockError = new Error("File upload error");
      // Set callback BEFORE calling the method
      (global as any).__mockMulterCallback = (
        req: any,
        res: any,
        callback: (err: any) => void
      ) => {
        callback(mockError);
      };

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async operations to complete
      // The callback is async and now properly awaited in the mock
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith(expect.any(HttpException));
    });

    it("should return 400 if no file uploaded", async () => {
      mockRequest.file = undefined;
      (global as any).__mockMulterCallback = (
        req: any,
        res: any,
        callback: (err: any) => void
      ) => {
        callback(null);
      };

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "No Excel file uploaded",
        })
      );
    });

    it("should process Excel file successfully", async () => {
      const mockBuffer = Buffer.from("test");
      mockRequest.file = {
        buffer: mockBuffer,
        fieldname: "excelFile",
        originalname: "test.xlsx",
        encoding: "7bit",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 100,
        destination: "",
        filename: "",
        path: "",
        stream: new Readable(),
      } as any;

      const mockWorkbook = {
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      };

      const mockJsonData = [{ virtualId: "token1", name: "User1" }];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockJsonData);
      (virtualIdService.decodeToken as jest.Mock).mockResolvedValue({
        success: true,
        virtual_id: "virtual123",
      });

      const mockExcelBuffer = Buffer.from("excel-data");
      (XLSX.utils.book_new as jest.Mock).mockReturnValue({});
      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue({});
      (XLSX.utils.book_append_sheet as jest.Mock).mockReturnValue(undefined);
      (XLSX.write as jest.Mock).mockReturnValue(mockExcelBuffer);

      (global as any).__mockMulterCallback = (
        req: any,
        res: any,
        callback: (err: any) => void
      ) => {
        callback(null);
      };

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(virtualIdService.decodeToken).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
    });

    it("should return 400 if Excel file is empty", async () => {
      const mockBuffer = Buffer.from("test");
      mockRequest.file = {
        buffer: mockBuffer,
        fieldname: "excelFile",
        originalname: "test.xlsx",
        encoding: "7bit",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 100,
        destination: "",
        filename: "",
        path: "",
        stream: new Readable(),
      } as any;

      const mockWorkbook = {
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      };

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([]);

      (global as any).__mockMulterCallback = (
        req: any,
        res: any,
        callback: (err: any) => void
      ) => {
        callback(null);
      };

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Excel file is empty",
        })
      );
    });

    it("should return 400 if virtualId column is missing", async () => {
      const mockBuffer = Buffer.from("test");
      mockRequest.file = {
        buffer: mockBuffer,
        fieldname: "excelFile",
        originalname: "test.xlsx",
        encoding: "7bit",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 100,
        destination: "",
        filename: "",
        path: "",
        stream: new Readable(),
      } as any;

      const mockWorkbook = {
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      };

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([
        { name: "Test", value: "123" },
      ]);

      (global as any).__mockMulterCallback = (
        req: any,
        res: any,
        callback: (err: any) => void
      ) => {
        callback(null);
      };

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(sendSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Column 'virtualId' not found in Excel file",
        })
      );
    });

    it("should handle Excel processing errors", async () => {
      const mockBuffer = Buffer.from("test");
      mockRequest.file = {
        buffer: mockBuffer,
        fieldname: "excelFile",
        originalname: "test.xlsx",
        encoding: "7bit",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 100,
        destination: "",
        filename: "",
        path: "",
        stream: new Readable(),
      } as any;

      (XLSX.read as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid Excel format");
      });

      (global as any).__mockMulterCallback = (
        req: any,
        res: any,
        callback: (err: any) => void
      ) => {
        callback(null);
      };

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(sendSpy).toHaveBeenCalledWith(expect.any(HttpException));
    });

    it("should handle outer catch block errors", async () => {
      // Mock multer to throw before returning middleware
      const mockMulter = require("multer");
      mockMulter.default.mockImplementationOnce(() => {
        throw new Error("Multer initialization error");
      });

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(sendSpy).toHaveBeenCalledWith(expect.any(HttpException));
    });

    it("should process multiple rows with mixed valid and invalid tokens", async () => {
      const mockBuffer = Buffer.from("test");
      mockRequest.file = {
        buffer: mockBuffer,
        fieldname: "excelFile",
        originalname: "test.xlsx",
        encoding: "7bit",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 100,
        destination: "",
        filename: "",
        path: "",
        stream: new Readable(),
      } as any;

      const mockWorkbook = {
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      };

      const mockJsonData = [
        { virtualId: "valid-token-1", name: "User1" },
        { virtualId: null, name: "User2" }, // Invalid: null token
        { virtualId: 123, name: "User3" }, // Invalid: non-string token
        { virtualId: "valid-token-2", name: "User4" },
        { virtualId: "", name: "User5" }, // Invalid: empty string
      ];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockJsonData);
      (virtualIdService.decodeToken as jest.Mock)
        .mockResolvedValueOnce({ success: true, virtual_id: "virtual123" })
        .mockResolvedValueOnce({ success: true, virtual_id: "virtual456" });

      const mockExcelBuffer = Buffer.from("excel-data");
      (XLSX.utils.book_new as jest.Mock).mockReturnValue({});
      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue({});
      (XLSX.utils.book_append_sheet as jest.Mock).mockReturnValue(undefined);
      (XLSX.write as jest.Mock).mockReturnValue(mockExcelBuffer);

      (global as any).__mockMulterCallback = (
        req: any,
        res: any,
        callback: (err: any) => void
      ) => {
        callback(null);
      };

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should decode only valid tokens (2 valid tokens)
      expect(virtualIdService.decodeToken).toHaveBeenCalledTimes(2);
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(setHeaderSpy).toHaveBeenCalledWith(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
    });

    it("should handle failed token decoding with error message", async () => {
      const mockBuffer = Buffer.from("test");
      mockRequest.file = {
        buffer: mockBuffer,
        fieldname: "excelFile",
        originalname: "test.xlsx",
        encoding: "7bit",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 100,
        destination: "",
        filename: "",
        path: "",
        stream: new Readable(),
      } as any;

      const mockWorkbook = {
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      };

      const mockJsonData = [{ virtualId: "invalid-token", name: "User1" }];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockJsonData);
      (virtualIdService.decodeToken as jest.Mock).mockResolvedValue({
        success: false,
        error: "Token expired",
      });

      const mockExcelBuffer = Buffer.from("excel-data");
      (XLSX.utils.book_new as jest.Mock).mockReturnValue({});
      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue({});
      (XLSX.utils.book_append_sheet as jest.Mock).mockReturnValue(undefined);
      (XLSX.write as jest.Mock).mockReturnValue(mockExcelBuffer);

      (global as any).__mockMulterCallback = (
        req: any,
        res: any,
        callback: (err: any) => void
      ) => {
        callback(null);
      };

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(virtualIdService.decodeToken).toHaveBeenCalledWith(
        "invalid-token"
      );
      expect(statusSpy).toHaveBeenCalledWith(200);
    });

    it("should handle token decoding exceptions", async () => {
      const mockBuffer = Buffer.from("test");
      mockRequest.file = {
        buffer: mockBuffer,
        fieldname: "excelFile",
        originalname: "test.xlsx",
        encoding: "7bit",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 100,
        destination: "",
        filename: "",
        path: "",
        stream: new Readable(),
      } as any;

      const mockWorkbook = {
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      };

      const mockJsonData = [{ virtualId: "token1", name: "User1" }];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockJsonData);
      (virtualIdService.decodeToken as jest.Mock).mockRejectedValue(
        new Error("Decoding failed")
      );

      const mockExcelBuffer = Buffer.from("excel-data");
      (XLSX.utils.book_new as jest.Mock).mockReturnValue({});
      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue({});
      (XLSX.utils.book_append_sheet as jest.Mock).mockReturnValue(undefined);
      (XLSX.write as jest.Mock).mockReturnValue(mockExcelBuffer);

      (global as any).__mockMulterCallback = (
        req: any,
        res: any,
        callback: (err: any) => void
      ) => {
        callback(null);
      };

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should handle the exception and continue processing
      expect(virtualIdService.decodeToken).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
    });

    it("should successfully process multiple valid tokens", async () => {
      const mockBuffer = Buffer.from("test");
      mockRequest.file = {
        buffer: mockBuffer,
        fieldname: "excelFile",
        originalname: "test.xlsx",
        encoding: "7bit",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 100,
        destination: "",
        filename: "",
        path: "",
        stream: new Readable(),
      } as any;

      const mockWorkbook = {
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      };

      const mockJsonData = [
        { virtualId: "token1", name: "User1", extra: "data1" },
        { virtualId: "token2", name: "User2", extra: "data2" },
        { virtualId: "token3", name: "User3", extra: "data3" },
      ];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockJsonData);
      (virtualIdService.decodeToken as jest.Mock)
        .mockResolvedValueOnce({ success: true, virtual_id: "virtual123" })
        .mockResolvedValueOnce({ success: true, virtual_id: "virtual456" })
        .mockResolvedValueOnce({ success: true, virtual_id: "virtual789" });

      const mockExcelBuffer = Buffer.from("excel-data");
      (XLSX.utils.book_new as jest.Mock).mockReturnValue({});
      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue({});
      (XLSX.utils.book_append_sheet as jest.Mock).mockReturnValue(undefined);
      (XLSX.write as jest.Mock).mockReturnValue(mockExcelBuffer);

      (global as any).__mockMulterCallback = (
        req: any,
        res: any,
        callback: (err: any) => void
      ) => {
        callback(null);
      };

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(virtualIdService.decodeToken).toHaveBeenCalledTimes(3);
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(setHeaderSpy).toHaveBeenCalledWith(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      expect(setHeaderSpy).toHaveBeenCalledWith(
        "Content-Disposition",
        'attachment; filename="processed_tokens.xlsx"'
      );
      expect(setHeaderSpy).toHaveBeenCalledWith(
        "Content-Length",
        mockExcelBuffer.length
      );
      expect(sendSpy).toHaveBeenCalledWith(mockExcelBuffer);
    });

    it("should handle failed token decoding without error message", async () => {
      const mockBuffer = Buffer.from("test");
      mockRequest.file = {
        buffer: mockBuffer,
        fieldname: "excelFile",
        originalname: "test.xlsx",
        encoding: "7bit",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 100,
        destination: "",
        filename: "",
        path: "",
        stream: new Readable(),
      } as any;

      const mockWorkbook = {
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      };

      const mockJsonData = [{ virtualId: "bad-token", name: "User1" }];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockJsonData);
      (virtualIdService.decodeToken as jest.Mock).mockResolvedValue({
        success: false,
        // No error property
      });

      const mockExcelBuffer = Buffer.from("excel-data");
      (XLSX.utils.book_new as jest.Mock).mockReturnValue({});
      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue({});
      (XLSX.utils.book_append_sheet as jest.Mock).mockReturnValue(undefined);
      (XLSX.write as jest.Mock).mockReturnValue(mockExcelBuffer);

      (global as any).__mockMulterCallback = (
        req: any,
        res: any,
        callback: (err: any) => void
      ) => {
        callback(null);
      };

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(virtualIdService.decodeToken).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
    });

    it("should handle decodeError without message property", async () => {
      const mockBuffer = Buffer.from("test");
      mockRequest.file = {
        buffer: mockBuffer,
        fieldname: "excelFile",
        originalname: "test.xlsx",
        encoding: "7bit",
        mimetype:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        size: 100,
        destination: "",
        filename: "",
        path: "",
        stream: new Readable(),
      } as any;

      const mockWorkbook = {
        SheetNames: ["Sheet1"],
        Sheets: { Sheet1: {} },
      };

      const mockJsonData = [{ virtualId: "token1", name: "User1" }];

      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockJsonData);

      // Create an error without message property
      const errorWithoutMessage = { toString: () => "Error occurred" };
      (virtualIdService.decodeToken as jest.Mock).mockRejectedValue(
        errorWithoutMessage
      );

      const mockExcelBuffer = Buffer.from("excel-data");
      (XLSX.utils.book_new as jest.Mock).mockReturnValue({});
      (XLSX.utils.json_to_sheet as jest.Mock).mockReturnValue({});
      (XLSX.utils.book_append_sheet as jest.Mock).mockReturnValue(undefined);
      (XLSX.write as jest.Mock).mockReturnValue(mockExcelBuffer);

      (global as any).__mockMulterCallback = (
        req: any,
        res: any,
        callback: (err: any) => void
      ) => {
        callback(null);
      };

      await virtualIdController.processExcelTokens(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async operations to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(virtualIdService.decodeToken).toHaveBeenCalled();
      expect(statusSpy).toHaveBeenCalledWith(200);
    });
  });
});
