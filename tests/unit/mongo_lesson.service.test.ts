import lessonServices from "../../src/mongo_module/modules/lesson/lesson.services";
import CrudOperations from "../../src/common/crud";
import Lesson from "../../src/mongo_module/models/lesson";
import { setupServiceTest } from "../helpers/test-utils";

// Mock CrudOperations
jest.mock("../../src/common/crud");
jest.mock("../../src/mongo_module/models/lesson", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("lessonServices", () => {
  let mockCrudOperations: jest.Mocked<CrudOperations>;
  let mockNext: jest.Mock;
  let mockLessonInstance: any;

  beforeEach(() => {
    const mocks = setupServiceTest(CrudOperations, Lesson, {});
    mockNext = mocks.mockNext;
    mockCrudOperations = mocks.mockCrudOperations as any;
    mockLessonInstance = mocks.mockInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addLesson", () => {
    it("should successfully add a lesson", async () => {
      const lesson = {
        userId: "user123",
        lessonId: "lesson123",
        language: "en",
        progress: 50,
      };

      const savedLesson = { ...lesson, _id: "123" };
      mockCrudOperations.save.mockResolvedValue(savedLesson);

      await lessonServices.addLesson(lesson, mockNext);

      expect(mockCrudOperations.save).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(null, savedLesson);
    });

    it("should handle errors when adding lesson", async () => {
      const lesson = {
        userId: "user123",
        lessonId: "lesson123",
        language: "en",
        progress: 50,
      };

      const error = new Error("Database error");
      mockCrudOperations.save.mockRejectedValue(error);

      await lessonServices.addLesson(lesson, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });

  describe("getLessonProgress", () => {
    it("should return lesson progress when data exists", async () => {
      const userID = "user123";
      const language = "en";
      const mockResult = [
        {
          userId: "user123",
          lessonId: "lesson123",
          language: "en",
          progress: 75,
        },
      ];

      mockCrudOperations.getAllDocuments.mockResolvedValue(mockResult);

      await lessonServices.getLessonProgress(userID, language, mockNext);

      expect(mockCrudOperations.getAllDocuments).toHaveBeenCalledWith(
        { userId: userID, language: language },
        { createdAt: -1 },
        1
      );
      expect(mockNext).toHaveBeenCalledWith(null, mockResult[0]);
    });

    it("should return 'No data found' when no data exists", async () => {
      const userID = "user123";
      const language = "en";

      mockCrudOperations.getAllDocuments.mockResolvedValue([]);

      await lessonServices.getLessonProgress(userID, language, mockNext);

      expect(mockNext).toHaveBeenCalledWith(null, "No data found for this user!");
    });

    it("should handle errors when getting lesson progress", async () => {
      const userID = "user123";
      const language = "en";
      const error = new Error("Database error");

      mockCrudOperations.getAllDocuments.mockRejectedValue(error);

      await lessonServices.getLessonProgress(userID, language, mockNext);

      expect(mockNext).toHaveBeenCalledWith("Something went wrong");
    });
  });
});

