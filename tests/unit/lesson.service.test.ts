import lessonSqlService from "../../src/sql_module/module/lesson_Module/lessonService";
import { myDataSource } from "../../src/sql_module/config/data.config";
import { Lesson } from "../../src/sql_module/schema/lesson";
import {
  setupRepositoryTest,
  expectServiceCallbackSuccess,
  expectServiceCallbackError,
  createTestLesson,
} from "../helpers/test-utils";

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
    const mocks = setupRepositoryTest(['create', 'save', 'find']);
    mockNext = mocks.mockNext;
    mockRepository = mocks.mockRepository;
    (myDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addLessonSql", () => {
    it("should successfully add a lesson", async () => {
      const lesson = createTestLesson();

      const createdLesson = { id: 1, ...lesson };
      mockRepository.create.mockReturnValue(createdLesson);
      mockRepository.save.mockResolvedValue(createdLesson);

      await lessonSqlService.addLessonSql(lesson, mockNext);

      expect(mockRepository.create).toHaveBeenCalledWith(lesson);
      expect(mockRepository.save).toHaveBeenCalledWith(createdLesson);
      expectServiceCallbackSuccess(mockNext, createdLesson);
    });

    it("should handle errors when adding lesson", async () => {
      const lesson = createTestLesson();

      const error = new Error("Database error");
      mockRepository.create.mockReturnValue(lesson);
      mockRepository.save.mockRejectedValue(error);

      await lessonSqlService.addLessonSql(lesson, mockNext);

      expectServiceCallbackError(mockNext, error, "Something went wrong!");
    });
  });

  describe("getLessonProgress", () => {
    it("should return lesson progress when data exists", async () => {
      const userID = "user123";
      const language = "en";
      const mockResult = [createTestLesson({ id: 1, progress: 75, createdAt: new Date() })];

      mockRepository.find.mockResolvedValue(mockResult);

      await lessonSqlService.getLessonProgress(userID, language, mockNext);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: userID, language: language },
        order: { createdAt: "DESC" },
      });
      expectServiceCallbackSuccess(mockNext, { result: mockResult[0] });
    });

    it("should return 'No data found' when no data exists", async () => {
      const userID = "user123";
      const language = "en";

      mockRepository.find.mockResolvedValue([]);

      await lessonSqlService.getLessonProgress(userID, language, mockNext);

      expectServiceCallbackSuccess(mockNext, "No data found for this user!");
    });

    it("should handle errors when getting lesson progress", async () => {
      const userID = "user123";
      const language = "en";
      const error = new Error("Database error");

      mockRepository.find.mockRejectedValue(error);

      await lessonSqlService.getLessonProgress(userID, language, mockNext);

      expectServiceCallbackError(mockNext, "Something went wrong");
    });
  });
});

