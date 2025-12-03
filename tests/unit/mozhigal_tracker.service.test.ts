import MozhigalTrackerServices from "../../src/mongo_module/modules/mozhigal_tracker/mozhigal_tracker.service";
import CrudOperations from "../../src/common/crud";
import learningLogs from "../../src/mongo_module/models/mozhigalScoreTracker";
import emisLessonMaster from "../../src/mongo_module/models/emisLessonMaster";

// Mock CrudOperations and models
jest.mock("../../src/common/crud");
jest.mock("../../src/mongo_module/models/mozhigalScoreTracker", () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock("../../src/mongo_module/models/emisLessonMaster", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("MozhigalTrackerServices", () => {
  let mockCrudOperations: jest.Mocked<CrudOperations>;
  let mockNext: jest.Mock;
  let mockLearningLogsInstance: any;

  beforeEach(() => {
    mockNext = jest.fn();
    mockLearningLogsInstance = {};

    mockCrudOperations = {
      getDocument: jest.fn(),
      save: jest.fn(),
      cummumulativeScoreDocument: jest.fn(),
      lessonScoreDocuments: jest.fn(),
      getAlllessonMasterDocuments: jest.fn(),
    } as any;

    (CrudOperations as jest.MockedClass<typeof CrudOperations>).mockImplementation(
      () => mockCrudOperations
    );
    (learningLogs as jest.MockedClass<typeof learningLogs>).mockImplementation(
      () => mockLearningLogsInstance
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addLearningLogs", () => {
    it("should successfully add learning logs", async () => {
      const learningLogsData = {
        score: 85,
        lesson_id: "lesson123",
      };
      const lessonId = "lesson123";
      const studentId = "student123";

      const lessonMasterData = {
        lesson_master_id: "master123",
        lesson_id: "lesson123",
      };

      mockCrudOperations.getDocument.mockResolvedValue(lessonMasterData);
      const savedLog = {
        ...learningLogsData,
        lesson_master_id: "master123",
        student_id: "student123",
        _id: "123",
      };
      mockCrudOperations.save.mockResolvedValue(savedLog);

      await MozhigalTrackerServices.addLearningLogs(
        learningLogsData,
        lessonId,
        studentId,
        mockNext
      );

      expect(mockCrudOperations.getDocument).toHaveBeenCalledWith(
        { lesson_id: lessonId },
        {}
      );
      expect(mockCrudOperations.save).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(null, savedLog);
    });

    it("should return error if lesson not found", async () => {
      const learningLogsData = {
        score: 85,
        lesson_id: "lesson123",
      };
      const lessonId = "lesson123";
      const studentId = "student123";

      mockCrudOperations.getDocument.mockResolvedValue(null);

      await MozhigalTrackerServices.addLearningLogs(
        learningLogsData,
        lessonId,
        studentId,
        mockNext
      );

      expect(mockCrudOperations.getDocument).toHaveBeenCalled();
      expect(mockCrudOperations.save).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(null, "No record found for this lesson_id");
    });

    it("should handle errors when adding learning logs", async () => {
      const learningLogsData = {
        score: 85,
        lesson_id: "lesson123",
      };
      const lessonId = "lesson123";
      const studentId = "student123";
      const error = new Error("Database error");

      mockCrudOperations.getDocument.mockRejectedValue(error);

      await MozhigalTrackerServices.addLearningLogs(
        learningLogsData,
        lessonId,
        studentId,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });

  describe("getCumulativeScore", () => {
    it("should return cumulative score", async () => {
      const studentId = "student123";
      const aggregateResult = [{ _id: "student123", totalScore: 250 }];

      mockCrudOperations.cummumulativeScoreDocument.mockResolvedValue(aggregateResult);

      await MozhigalTrackerServices.getCumulativeScore(studentId, mockNext);

      expect(mockCrudOperations.cummumulativeScoreDocument).toHaveBeenCalledWith(studentId);
      expect(mockNext).toHaveBeenCalledWith(null, {
        studentId,
        totalScore: 250,
      });
    });

    it("should return error if student not found or no scores", async () => {
      const studentId = "student123";

      mockCrudOperations.cummumulativeScoreDocument.mockResolvedValue([]);

      await MozhigalTrackerServices.getCumulativeScore(studentId, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        null,
        "Student not found or no scores available"
      );
    });

    it("should return error if totalScore is null", async () => {
      const studentId = "student123";
      const aggregateResult = [{ _id: "student123", totalScore: null }];

      mockCrudOperations.cummumulativeScoreDocument.mockResolvedValue(aggregateResult);

      await MozhigalTrackerServices.getCumulativeScore(studentId, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        null,
        "Student not found or no scores available"
      );
    });

    it("should handle errors when getting cumulative score", async () => {
      const studentId = "student123";
      const error = new Error("Database error");

      mockCrudOperations.cummumulativeScoreDocument.mockRejectedValue(error);

      await MozhigalTrackerServices.getCumulativeScore(studentId, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });

  describe("getLessonWiseScore", () => {
    it("should return lesson-wise scores", async () => {
      const studentId = "student123";
      const scoreResult = [
        { _id: "master123", totalScore: 100 },
        { _id: "master456", totalScore: 150 },
      ];
      const lessonResult = {
        master123: "lesson123",
        master456: "lesson456",
      };

      mockCrudOperations.lessonScoreDocuments.mockResolvedValue(scoreResult);
      mockCrudOperations.getAlllessonMasterDocuments.mockResolvedValue(lessonResult);

      await MozhigalTrackerServices.getLessonWiseScore(studentId, mockNext);

      expect(mockCrudOperations.lessonScoreDocuments).toHaveBeenCalledWith(studentId);
      expect(mockCrudOperations.getAlllessonMasterDocuments).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(null, [
        { score: 100, lesson_id: "lesson123" },
        { score: 150, lesson_id: "lesson456" },
      ]);
    });

    it("should handle empty score results", async () => {
      const studentId = "student123";
      const lessonResult = {};

      mockCrudOperations.lessonScoreDocuments.mockResolvedValue([]);
      mockCrudOperations.getAlllessonMasterDocuments.mockResolvedValue(lessonResult);

      await MozhigalTrackerServices.getLessonWiseScore(studentId, mockNext);

      expect(mockNext).toHaveBeenCalledWith(null, []);
    });

    it("should handle errors when getting lesson-wise scores", async () => {
      const studentId = "student123";
      const error = new Error("Database error");

      mockCrudOperations.lessonScoreDocuments.mockRejectedValue(error);

      await MozhigalTrackerServices.getLessonWiseScore(studentId, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });
});

