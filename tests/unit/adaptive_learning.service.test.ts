import AdaptiveLearningServices from "../../src/mongo_module/modules/adaptiveLearning/adaptive_learning.service";
import CrudOperations from "../../src/common/crud";
import adaptiveLearning from "../../src/mongo_module/models/adaptiveLearning";

// Mock CrudOperations
jest.mock("../../src/common/crud");
jest.mock("../../src/mongo_module/models/adaptiveLearning", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("AdaptiveLearningServices", () => {
  let mockCrudOperations: jest.Mocked<CrudOperations>;
  let mockNext: jest.Mock;
  let mockAdaptiveLearningInstance: any;

  beforeEach(() => {
    mockNext = jest.fn();
    mockAdaptiveLearningInstance = {};

    mockCrudOperations = {
      getDocument: jest.fn(),
      save: jest.fn(),
      getAllDocuments: jest.fn(),
      deleteDocument: jest.fn(),
    } as any;

    (CrudOperations as jest.MockedClass<typeof CrudOperations>).mockImplementation(
      () => mockCrudOperations
    );
    (adaptiveLearning as jest.MockedClass<typeof adaptiveLearning>).mockImplementation(
      () => mockAdaptiveLearningInstance
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addSchoolUdise", () => {
    it("should successfully add school UDISE", async () => {
      const schoolData = {
        udise_code: "123456",
        school_name: "Test School",
      };

      mockCrudOperations.getDocument.mockResolvedValue(null);
      const savedData = { ...schoolData, _id: "123" };
      mockCrudOperations.save.mockResolvedValue(savedData);

      await AdaptiveLearningServices.addSchoolUdise(schoolData, mockNext);

      expect(mockCrudOperations.getDocument).toHaveBeenCalledWith(
        { udise_code: schoolData.udise_code },
        {}
      );
      expect(mockCrudOperations.save).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(null, savedData);
    });

    it("should return error if UDISE code already exists", async () => {
      const schoolData = {
        udise_code: "123456",
        school_name: "Test School",
      };

      const existingData = { ...schoolData, _id: "123" };
      mockCrudOperations.getDocument.mockResolvedValue(existingData);

      await AdaptiveLearningServices.addSchoolUdise(schoolData, mockNext);

      expect(mockCrudOperations.getDocument).toHaveBeenCalled();
      expect(mockCrudOperations.save).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(null, "udise_code is already exists");
    });

    it("should handle errors when adding school UDISE", async () => {
      const schoolData = {
        udise_code: "123456",
        school_name: "Test School",
      };

      const error = new Error("Database error");
      mockCrudOperations.getDocument.mockRejectedValue(error);

      await AdaptiveLearningServices.addSchoolUdise(schoolData, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });

  describe("validateUdise", () => {
    it("should return status true if UDISE code exists", async () => {
      const udiseCode = "123456";
      const existingData = { udise_code: "123456", school_name: "Test School" };

      mockCrudOperations.getDocument.mockResolvedValue(existingData);

      await AdaptiveLearningServices.validateUdise(udiseCode, mockNext);

      expect(mockCrudOperations.getDocument).toHaveBeenCalledWith(
        { udise_code: udiseCode },
        {}
      );
      expect(mockNext).toHaveBeenCalledWith(null, { status: true });
    });

    it("should return status false if UDISE code does not exist", async () => {
      const udiseCode = "123456";

      mockCrudOperations.getDocument.mockResolvedValue(null);

      await AdaptiveLearningServices.validateUdise(udiseCode, mockNext);

      expect(mockNext).toHaveBeenCalledWith(null, { status: false });
    });

    it("should handle errors when validating UDISE", async () => {
      const udiseCode = "123456";
      const error = new Error("Database error");

      mockCrudOperations.getDocument.mockRejectedValue(error);

      await AdaptiveLearningServices.validateUdise(udiseCode, mockNext);

      expect(mockNext).toHaveBeenCalledWith("Something went wrong");
    });
  });

  describe("deleteUdise", () => {
    it("should successfully delete UDISE code", async () => {
      const udiseCode = "123456";
      const existingData = { udise_code: "123456", school_name: "Test School" };

      mockCrudOperations.getDocument.mockResolvedValue(existingData);
      mockCrudOperations.deleteDocument.mockResolvedValue({ deletedCount: 1 });

      await AdaptiveLearningServices.deleteUdise(udiseCode, mockNext);

      expect(mockCrudOperations.getDocument).toHaveBeenCalledWith(
        { udise_code: udiseCode },
        {}
      );
      expect(mockCrudOperations.deleteDocument).toHaveBeenCalledWith({
        udise_code: udiseCode,
      });
      expect(mockNext).toHaveBeenCalledWith(null, "record deleted successfully!");
    });

    it("should return error if UDISE code not found", async () => {
      const udiseCode = "123456";

      mockCrudOperations.getDocument.mockResolvedValue(null);

      await AdaptiveLearningServices.deleteUdise(udiseCode, mockNext);

      expect(mockCrudOperations.getDocument).toHaveBeenCalled();
      expect(mockCrudOperations.deleteDocument).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(null, "No record found to delete");
    });

    it("should handle errors when deleting UDISE", async () => {
      const udiseCode = "123456";
      const error = new Error("Database error");

      mockCrudOperations.getDocument.mockRejectedValue(error);

      await AdaptiveLearningServices.deleteUdise(udiseCode, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });

  describe("getAllUdeise", () => {
    it("should return all UDISE codes", async () => {
      const allRecords = [
        { udise_code: "123456", school_name: "School 1" },
        { udise_code: "789012", school_name: "School 2" },
      ];

      mockCrudOperations.getAllDocuments.mockResolvedValue(allRecords);

      await AdaptiveLearningServices.getAllUdeise(mockNext);

      expect(mockCrudOperations.getAllDocuments).toHaveBeenCalledWith({}, {}, {});
      expect(mockNext).toHaveBeenCalledWith(null, allRecords);
    });

    it("should handle errors when getting all UDISE codes", async () => {
      const error = new Error("Database error");

      mockCrudOperations.getAllDocuments.mockRejectedValue(error);

      await AdaptiveLearningServices.getAllUdeise(mockNext);

      expect(mockNext).toHaveBeenCalledWith("Something went wrong");
    });
  });
});

