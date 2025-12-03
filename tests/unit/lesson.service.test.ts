import lessonSqlService from "../../src/sql_module/module/lesson_Module/lessonService";
import { myDataSource } from "../../src/sql_module/config/data.config";
import { Lesson } from "../../src/sql_module/schema/lesson";

// Mock the data source
jest.mock("../../src/sql_module/config/data.config", () => ({
  myDataSource: {
    getRepository: jest.fn(),
  },
}));

describe("lessonSqlService", () => {
  let mockRepository: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockNext = jest.fn();
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };
    (myDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addLessonSql", () => {
    it("should successfully add a lesson", async () => {
      const lesson = {
        userId: "user123",
        lessonId: "lesson123",
        language: "en",
        progress: 50,
      };

      const createdLesson = { id: 1, ...lesson };
      mockRepository.create.mockReturnValue(createdLesson);
      mockRepository.save.mockResolvedValue(createdLesson);

      await lessonSqlService.addLessonSql(lesson, mockNext);

      expect(mockRepository.create).toHaveBeenCalledWith(lesson);
      expect(mockRepository.save).toHaveBeenCalledWith(createdLesson);
      expect(mockNext).toHaveBeenCalledWith(null, createdLesson);
    });

    it("should handle errors when adding lesson", async () => {
      const lesson = {
        userId: "user123",
        lessonId: "lesson123",
        language: "en",
        progress: 50,
      };

      const error = new Error("Database error");
      mockRepository.create.mockReturnValue(lesson);
      mockRepository.save.mockRejectedValue(error);

      await lessonSqlService.addLessonSql(lesson, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });

  describe("getLessonProgress", () => {
    it("should return lesson progress when data exists", async () => {
      const userID = "user123";
      const language = "en";
      const mockResult = [
        {
          id: 1,
          userId: "user123",
          lessonId: "lesson123",
          language: "en",
          progress: 75,
          createdAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockResult);

      await lessonSqlService.getLessonProgress(userID, language, mockNext);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: userID, language: language },
        order: { createdAt: "DESC" },
      });
      expect(mockNext).toHaveBeenCalledWith(null, { result: mockResult[0] });
    });

    it("should return 'No data found' when no data exists", async () => {
      const userID = "user123";
      const language = "en";

      mockRepository.find.mockResolvedValue([]);

      await lessonSqlService.getLessonProgress(userID, language, mockNext);

      expect(mockNext).toHaveBeenCalledWith(null, "No data found for this user!");
    });

    it("should handle errors when getting lesson progress", async () => {
      const userID = "user123";
      const language = "en";
      const error = new Error("Database error");

      mockRepository.find.mockRejectedValue(error);

      await lessonSqlService.getLessonProgress(userID, language, mockNext);

      expect(mockNext).toHaveBeenCalledWith("Something went wrong");
    });
  });
});

