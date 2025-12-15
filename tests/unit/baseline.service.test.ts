import BaselineService from "../../src/mongo_module/modules/baseline_assessment/baseline.service";
import CrudOperations from "../../src/common/crud";
import BaselineAssessment from "../../src/mongo_module/models/baseline_assess";
import {
  setupServiceTest,
  expectServiceCallbackError,
  expectServiceCallbackSuccess,
} from "../helpers/test-utils";

// Mock CrudOperations
jest.mock("../../src/common/crud");
jest.mock("../../src/mongo_module/models/baseline_assess", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("BaselineService", () => {
  let mockCrudOperations: any;
  let mockNext: jest.Mock;
  let mockBaselineInstance: any;

  beforeEach(() => {
    const mocks = setupServiceTest(CrudOperations, BaselineAssessment, {
      toObject: jest.fn().mockReturnValue({}),
    });
    mockNext = mocks.mockNext;
    mockCrudOperations = mocks.mockCrudOperations;
    mockBaselineInstance = mocks.mockInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addBaseline", () => {
    it("should successfully add baseline assessment", async () => {
      const Baseline = {
        student_id: "student123",
        assessment_id: "assessment123",
        score: 85,
      };

      mockCrudOperations.getAllDocuments.mockResolvedValue([]);
      const savedBaseline = {
        ...Baseline,
        _id: "123",
        toObject: jest.fn().mockReturnValue({ ...Baseline, _id: "123" }),
      };
      mockCrudOperations.save.mockResolvedValue(savedBaseline);

      await BaselineService.addBaseline(Baseline, mockNext);

      expect(mockCrudOperations.getAllDocuments).toHaveBeenCalledWith(
        { studentId: Baseline.student_id, assessmentId: Baseline.assessment_id },
        {},
        {}
      );
      expect(mockCrudOperations.save).toHaveBeenCalled();
      expectServiceCallbackSuccess(mockNext, { ...Baseline, _id: "123" });
    });

    it("should return error if baseline already submitted", async () => {
      const Baseline = {
        student_id: "student123",
        assessment_id: "assessment123",
        score: 85,
      };

      const existingBaseline = [{ ...Baseline, _id: "123" }];
      mockCrudOperations.getAllDocuments.mockResolvedValue(existingBaseline);

      await BaselineService.addBaseline(Baseline, mockNext);

      expect(mockCrudOperations.getAllDocuments).toHaveBeenCalled();
      expect(mockCrudOperations.save).not.toHaveBeenCalled();
      expectServiceCallbackSuccess(mockNext, "Baseline Quiz already submitted by this student");
    });

    it("should handle errors when adding baseline", async () => {
      const Baseline = {
        student_id: "student123",
        assessment_id: "assessment123",
        score: 85,
      };

      const error = new Error("Database error");
      mockCrudOperations.getAllDocuments.mockRejectedValue(error);

      await BaselineService.addBaseline(Baseline, mockNext);

      expectServiceCallbackError(mockNext, error, "Something went wrong!");
    });
  });

  describe("getBaseline", () => {
    it("should return baseline data with assessment ID", async () => {
      const student_id = "student123";
      const assessment_Id = "assessment123";
      const baselineData = [
        {
          student_id: "student123",
          assessment_id: "assessment123",
          score: 85,
        },
      ];

      mockCrudOperations.getAllDocuments.mockResolvedValue(baselineData);

      await BaselineService.getBaseline(student_id, assessment_Id, mockNext);

      expect(mockCrudOperations.getAllDocuments).toHaveBeenCalledWith(
        { student_id: student_id, assessment_id: assessment_Id },
        {},
        {}
      );
      expectServiceCallbackSuccess(mockNext, baselineData);
    });

    it("should return all baseline data for student when assessment ID not provided", async () => {
      const student_id = "student123";
      const assessment_Id = "";
      const baselineData = [
        {
          student_id: "student123",
          assessment_id: "assessment123",
          score: 85,
        },
        {
          student_id: "student123",
          assessment_id: "assessment456",
          score: 90,
        },
      ];

      mockCrudOperations.getAllDocuments.mockResolvedValue(baselineData);

      await BaselineService.getBaseline(student_id, assessment_Id, mockNext);

      expect(mockCrudOperations.getAllDocuments).toHaveBeenCalledWith(
        { student_id: student_id },
        {},
        {}
      );
      expectServiceCallbackSuccess(mockNext, baselineData);
    });

    it("should handle errors when getting baseline", async () => {
      const student_id = "student123";
      const assessment_Id = "assessment123";
      const error = new Error("Database error");

      mockCrudOperations.getAllDocuments.mockRejectedValue(error);

      await BaselineService.getBaseline(student_id, assessment_Id, mockNext);

      expectServiceCallbackError(mockNext, error, "Something went wrong!");
    });
  });
});

