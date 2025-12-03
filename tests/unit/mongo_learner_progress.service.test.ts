import LearnerProgressServices from "../../src/mongo_module/modules/learner_progress/learner_progress.services";
import CrudOperations from "../../src/common/crud";
import LearnerProgress from "../../src/mongo_module/models/learnerProgress";

// Mock CrudOperations
jest.mock("../../src/common/crud");
jest.mock("../../src/mongo_module/models/learnerProgress", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("LearnerProgressServices", () => {
  let mockCrudOperations: jest.Mocked<CrudOperations>;
  let mockNext: jest.Mock;
  let mockLearnerProgressInstance: any;

  beforeEach(() => {
    mockNext = jest.fn();
    mockLearnerProgressInstance = {};

    mockCrudOperations = {
      save: jest.fn(),
      getAllDocuments: jest.fn(),
    } as any;

    (CrudOperations as jest.MockedClass<typeof CrudOperations>).mockImplementation(
      () => mockCrudOperations
    );
    (LearnerProgress as jest.MockedClass<typeof LearnerProgress>).mockImplementation(
      () => mockLearnerProgressInstance
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createLearnerProgress", () => {
    it("should successfully create learner progress", async () => {
      const learnerProgress = {
        userId: "user123",
        sessionId: "session123",
        lessonId: "lesson123",
        progress: 50,
      };

      const savedProgress = { ...learnerProgress, _id: "123" };
      mockCrudOperations.save.mockResolvedValue(savedProgress);

      await LearnerProgressServices.createLearnerProgress(learnerProgress, mockNext);

      expect(mockCrudOperations.save).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(null, savedProgress);
    });

    it("should handle errors when creating learner progress", async () => {
      const learnerProgress = {
        userId: "user123",
        sessionId: "session123",
        lessonId: "lesson123",
        progress: 50,
      };

      const error = new Error("Database error");
      mockCrudOperations.save.mockRejectedValue(error);

      await LearnerProgressServices.createLearnerProgress(learnerProgress, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });

  describe("getLessonProgress", () => {
    it("should return learner progress when data exists", async () => {
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

      await LearnerProgressServices.getLessonProgress(userID, language, mockNext);

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

      await LearnerProgressServices.getLessonProgress(userID, language, mockNext);

      expect(mockNext).toHaveBeenCalledWith(null, "No data found for this user!");
    });

    it("should handle errors when getting learner progress", async () => {
      const userID = "user123";
      const language = "en";
      const error = new Error("Database error");

      mockCrudOperations.getAllDocuments.mockRejectedValue(error);

      await LearnerProgressServices.getLessonProgress(userID, language, mockNext);

      expect(mockNext).toHaveBeenCalledWith("Something went wrong");
    });
  });
});

