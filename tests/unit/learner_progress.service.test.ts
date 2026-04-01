import learnerProgressService from "../../src/sql_module/module/learner_progress_Module/learner_progress.service";
import { myDataSource } from "../../src/sql_module/config/data.config";
import { learner_progress } from "../../src/sql_module/schema/learnerProgress";
import { setupRepositoryTest } from "../helpers/test-utils";

// Mock the data source
jest.mock("../../src/sql_module/config/data.config", () => ({
  myDataSource: {
    getRepository: jest.fn(),
  },
}));

describe("learnerProgressService", () => {
  let mockRepository: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    const mocks = setupRepositoryTest(['create', 'save', 'findOne', 'find', 'update', 'delete']);
    mockNext = mocks.mockNext;
    mockRepository = mocks.mockRepository;
    (myDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addlessonProgress", () => {
    it("should successfully add lesson progress", async () => {
      const lessonProgress: learner_progress = {
        id: 1,
        userId: "user123",
        sessionId: "session123",
        subSessionId: "subsession123",
        milestoneLevel: "level1",
        language: "en",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createdProgress = { ...lessonProgress };
      mockRepository.create.mockReturnValue(createdProgress);
      mockRepository.save.mockResolvedValue(createdProgress);

      await learnerProgressService.addlessonProgress(lessonProgress, mockNext);

      expect(mockRepository.create).toHaveBeenCalledWith(lessonProgress);
      expect(mockRepository.save).toHaveBeenCalledWith(createdProgress);
      expect(mockNext).toHaveBeenCalledWith(null, createdProgress);
    });

    it("should handle errors when adding lesson progress", async () => {
      const lessonProgress: learner_progress = {
        id: 1,
        userId: "user123",
        sessionId: "session123",
        subSessionId: "subsession123",
        milestoneLevel: "level1",
        language: "en",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const error = new Error("Database error");
      mockRepository.create.mockReturnValue(lessonProgress);
      mockRepository.save.mockRejectedValue(error);

      await learnerProgressService.addlessonProgress(lessonProgress, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });

  describe("getLatestLearnerProgressByuserId", () => {
    it("should return latest learner progress by user ID", async () => {
      const userId = "user123";
      const mockProgress = {
        id: 1,
        userId: "user123",
        milestoneLevel: "level1",
        language: "en",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockProgress);

      await learnerProgressService.getLatestLearnerProgressByuserId(
        userId,
        mockNext
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId: userId },
        order: { createdAt: "DESC" },
      });
      expect(mockNext).toHaveBeenCalledWith(null, mockProgress);
    });

    it("should handle errors when getting latest progress", async () => {
      const userId = "user123";
      const error = new Error("Database error");
      mockRepository.findOne.mockRejectedValue(error);

      await expect(
        learnerProgressService.getLatestLearnerProgressByuserId(userId, mockNext)
      ).rejects.toThrow("Failed to get latest learner progress.");

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("getLearnerProgressById", () => {
    it("should return learner progress by ID", async () => {
      const id = 1;
      const mockProgress = [
        {
          id: 1,
          userId: "user123",
          milestoneLevel: "level1",
          language: "en",
        },
      ];

      mockRepository.find.mockResolvedValue(mockProgress);

      await learnerProgressService.getLearnerProgressById(id, mockNext);

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { id: id } });
      expect(mockNext).toHaveBeenCalledWith(null, mockProgress);
    });

    it("should handle errors when getting progress by ID", async () => {
      const id = 1;
      const error = new Error("Database error");
      mockRepository.find.mockRejectedValue(error);

      await expect(
        learnerProgressService.getLearnerProgressById(id, mockNext)
      ).rejects.toThrow("Failed to get learner progress.");

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("getLearnerProgressByUserId", () => {
    it("should return learner progress by user ID", async () => {
      const userId = "user123";
      const mockProgress = [
        {
          id: 1,
          userId: "user123",
          milestoneLevel: "level1",
          language: "en",
        },
      ];

      mockRepository.find.mockResolvedValue(mockProgress);

      await learnerProgressService.getLearnerProgressByUserId(userId, mockNext);

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { userId } });
      expect(mockNext).toHaveBeenCalledWith(null, mockProgress);
    });

    it("should handle errors when getting progress by user ID", async () => {
      const userId = "user123";
      const error = new Error("Database error");
      mockRepository.find.mockRejectedValue(error);

      await expect(
        learnerProgressService.getLearnerProgressByUserId(userId, mockNext)
      ).rejects.toThrow("Failed to get learner progress by user ID.");

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("getLearnerProgressBySessionId", () => {
    it("should return learner progress by session ID", async () => {
      const sessionId = "session123";
      const mockProgress = [
        {
          id: 1,
          sessionId: "session123",
          milestoneLevel: "level1",
          language: "en",
        },
      ];

      mockRepository.find.mockResolvedValue(mockProgress);

      await learnerProgressService.getLearnerProgressBySessionId(
        sessionId,
        mockNext
      );

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { sessionId: sessionId },
      });
      expect(mockNext).toHaveBeenCalledWith(null, mockProgress);
    });

    it("should handle errors when getting progress by session ID", async () => {
      const sessionId = "session123";
      const error = new Error("Database error");
      mockRepository.find.mockRejectedValue(error);

      await expect(
        learnerProgressService.getLearnerProgressBySessionId(sessionId, mockNext)
      ).rejects.toThrow("Failed to get learner progress by session ID.");

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("getLearnerProgressBySubSessionId", () => {
    it("should return learner progress by sub-session ID", async () => {
      const subSessionId = "subsession123";
      const mockProgress = [
        {
          id: 1,
          subSessionId: "subsession123",
          milestoneLevel: "level1",
          language: "en",
        },
      ];

      mockRepository.find.mockResolvedValue(mockProgress);

      await learnerProgressService.getLearnerProgressBySubSessionId(
        subSessionId,
        mockNext
      );

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { subSessionId: subSessionId },
      });
      expect(mockNext).toHaveBeenCalledWith(null, mockProgress);
    });

    it("should handle errors when getting progress by sub-session ID", async () => {
      const subSessionId = "subsession123";
      const error = new Error("Database error");
      mockRepository.find.mockRejectedValue(error);

      await expect(
        learnerProgressService.getLearnerProgressBySubSessionId(
          subSessionId,
          mockNext
        )
      ).rejects.toThrow("Failed to get learner progress by sub-session ID.");

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("updateLearnerProgressById", () => {
    it("should update learner progress by ID", async () => {
      const id = 1;
      const newProgressData = { milestoneLevel: "level2" };
      const mockUpdateResult = { affected: 1 };

      mockRepository.update.mockResolvedValue(mockUpdateResult);

      await learnerProgressService.updateLearnerProgressById(
        id,
        newProgressData,
        mockNext
      );

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: id },
        newProgressData
      );
      expect(mockNext).toHaveBeenCalledWith(null, mockUpdateResult);
    });

    it("should handle errors when updating progress by ID", async () => {
      const id = 1;
      const newProgressData = { milestoneLevel: "level2" };
      const error = new Error("Database error");
      mockRepository.update.mockRejectedValue(error);

      await expect(
        learnerProgressService.updateLearnerProgressById(
          id,
          newProgressData,
          mockNext
        )
      ).rejects.toThrow("Failed to update learner progress by user ID.");

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("updateLearnerProgressBysubsessionId", () => {
    it("should update learner progress by sub-session ID", async () => {
      const subSessionId = "subsession123";
      const newProgressData = { milestoneLevel: "level2" };
      const mockUpdateResult = { affected: 1 };

      mockRepository.update.mockResolvedValue(mockUpdateResult);

      await learnerProgressService.updateLearnerProgressBysubsessionId(
        subSessionId,
        newProgressData,
        mockNext
      );

      expect(mockRepository.update).toHaveBeenCalledWith(
        { subSessionId: subSessionId },
        newProgressData
      );
      expect(mockNext).toHaveBeenCalledWith(null, mockUpdateResult);
    });

    it("should handle errors when updating progress by sub-session ID", async () => {
      const subSessionId = "subsession123";
      const newProgressData = { milestoneLevel: "level2" };
      const error = new Error("Database error");
      mockRepository.update.mockRejectedValue(error);

      await expect(
        learnerProgressService.updateLearnerProgressBysubsessionId(
          subSessionId,
          newProgressData,
          mockNext
        )
      ).rejects.toThrow("Failed to update learner progress by user ID.");

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("deleteLearnerProgressById", () => {
    it("should delete learner progress by ID", async () => {
      const id = "1";
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await learnerProgressService.deleteLearnerProgressById(id, mockNext);

      expect(mockRepository.delete).toHaveBeenCalledWith({ id: id });
      expect(mockNext).toHaveBeenCalledWith(null, `Deleted id - ${id} entry`);
    });

    it("should handle errors when deleting progress by ID", async () => {
      const id = "1";
      const error = new Error("Database error");
      mockRepository.delete.mockRejectedValue(error);

      await expect(
        learnerProgressService.deleteLearnerProgressById(id, mockNext)
      ).rejects.toThrow("Failed to delete learner progress by user ID.");

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("deleteLearnerProgressByUserId", () => {
    it("should delete learner progress by user ID", async () => {
      const userId = "user123";
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await learnerProgressService.deleteLearnerProgressByUserId(userId, mockNext);

      expect(mockRepository.delete).toHaveBeenCalledWith({ userId: userId });
      expect(mockNext).toHaveBeenCalledWith(
        null,
        `Deleted user id - ${userId} entry`
      );
    });

    it("should handle errors when deleting progress by user ID", async () => {
      const userId = "user123";
      const error = new Error("Database error");
      mockRepository.delete.mockRejectedValue(error);

      await expect(
        learnerProgressService.deleteLearnerProgressByUserId(userId, mockNext)
      ).rejects.toThrow("Failed to delete learner progress by user ID.");

      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("deleteLearnerProgressBySubSessionId", () => {
    it("should delete learner progress by sub-session ID", async () => {
      const subSessionId = "subsession123";
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await learnerProgressService.deleteLearnerProgressBySubSessionId(
        subSessionId,
        mockNext
      );

      expect(mockRepository.delete).toHaveBeenCalledWith({
        subSessionId: subSessionId,
      });
      expect(mockNext).toHaveBeenCalledWith(
        null,
        `Deleted sub session id - ${subSessionId} entry`
      );
    });

    it("should handle errors when deleting progress by sub-session ID", async () => {
      const subSessionId = "subsession123";
      const error = new Error("Database error");
      mockRepository.delete.mockRejectedValue(error);

      await expect(
        learnerProgressService.deleteLearnerProgressBySubSessionId(
          subSessionId,
          mockNext
        )
      ).rejects.toThrow("Failed to delete learner progress by sub-session ID.");

      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

