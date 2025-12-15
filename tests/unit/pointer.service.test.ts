import pointerSqlService from "../../src/sql_module/module/pointer_Module/pointerScrvice";
import { myDataSource } from "../../src/sql_module/config/data.config";
import { Point } from "../../src/sql_module/schema/point";
import { setupRepositoryTest } from "../helpers/test-utils";

// Mock the data source
jest.mock("../../src/sql_module/config/data.config", () => ({
  myDataSource: {
    getRepository: jest.fn(),
  },
}));

describe("pointerSqlService", () => {
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

  describe("addPointer", () => {
    it("should successfully add a pointer and calculate totals", async () => {
      const points: Point = {
        id: 1,
        userId: "user123",
        sessionId: "session123",
        language: "en",
        points: "10",
        milestone: "milestone1",
        createdAt: new Date(),
      };

      const savedPoint = { ...points };
      mockRepository.create.mockReturnValue(savedPoint);
      mockRepository.save.mockResolvedValue(savedPoint);

      // Mock find calls for calculating totals
      const userPointers = [
        { ...points, points: "10" },
        { ...points, id: 2, points: "20" },
      ];
      const sessionPointers = [
        { ...points, points: "10" },
        { ...points, id: 3, points: "15" },
      ];
      const languagePointers = [
        { ...points, points: "10" },
        { ...points, id: 4, points: "5" },
      ];

      mockRepository.find
        .mockResolvedValueOnce(userPointers) // For userId
        .mockResolvedValueOnce(sessionPointers) // For sessionId
        .mockResolvedValueOnce(languagePointers); // For userId + language

      await pointerSqlService.addPointer(points, mockNext);

      expect(mockRepository.create).toHaveBeenCalledWith(points);
      expect(mockRepository.save).toHaveBeenCalledWith(savedPoint);
      expect(mockRepository.find).toHaveBeenCalledTimes(3);
      expect(mockNext).toHaveBeenCalledWith(null, {
        ...savedPoint,
        totalUserPoints: 30,
        totalSessionPoints: 25,
        totalLanguagePoints: 15,
      });
    });

    it("should handle zero points correctly", async () => {
      const points: Point = {
        id: 1,
        userId: "user123",
        sessionId: "session123",
        language: "en",
        points: "0",
        milestone: "milestone1",
        createdAt: new Date(),
      };

      const savedPoint = { ...points };
      mockRepository.create.mockReturnValue(savedPoint);
      mockRepository.save.mockResolvedValue(savedPoint);
      mockRepository.find.mockResolvedValue([savedPoint]);

      await pointerSqlService.addPointer(points, mockNext);

      expect(mockNext).toHaveBeenCalledWith(null, {
        ...savedPoint,
        totalUserPoints: 0,
        totalSessionPoints: 0,
        totalLanguagePoints: 0,
      });
    });

    it("should handle errors when adding pointer", async () => {
      const points: Point = {
        id: 1,
        userId: "user123",
        sessionId: "session123",
        language: "en",
        points: "10",
        milestone: "milestone1",
        createdAt: new Date(),
      };

      const error = new Error("Database error");
      mockRepository.create.mockReturnValue(points);
      mockRepository.save.mockRejectedValue(error);

      await pointerSqlService.addPointer(points, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });

  describe("getPointersByUserID", () => {
    it("should return pointers with totals", async () => {
      const userID = "user123";
      const sessionID = "session123";
      const language = "en";

      const userPointers = [
        { id: 1, userId: "user123", points: "10" },
        { id: 2, userId: "user123", points: "20" },
      ];
      const languagePointers = [
        { id: 1, userId: "user123", language: "en", points: "10" },
        { id: 2, userId: "user123", language: "en", points: "5" },
      ];
      const sessionPointers = [
        { id: 1, sessionId: "session123", points: "10" },
        { id: 3, sessionId: "session123", points: "15" },
      ];

      mockRepository.find
        .mockResolvedValueOnce(userPointers)
        .mockResolvedValueOnce(languagePointers)
        .mockResolvedValueOnce(sessionPointers);

      await pointerSqlService.getPointersByUserID(userID, sessionID, language, mockNext);

      expect(mockRepository.find).toHaveBeenCalledTimes(3);
      expect(mockNext).toHaveBeenCalledWith(null, {
        totalUserPoints: 30,
        totalLanguagePoints: 15,
        totalSessionPoints: 25,
        result: userPointers,
      });
    });

    it("should handle empty results", async () => {
      const userID = "user123";
      const sessionID = "session123";
      const language = "en";

      mockRepository.find.mockResolvedValue([]);

      await pointerSqlService.getPointersByUserID(userID, sessionID, language, mockNext);

      expect(mockNext).toHaveBeenCalledWith(null, {
        totalUserPoints: 0,
        totalLanguagePoints: 0,
        totalSessionPoints: 0,
        result: [],
      });
    });

    it("should handle errors when getting pointers", async () => {
      const userID = "user123";
      const sessionID = "session123";
      const language = "en";
      const error = new Error("Database error");

      mockRepository.find.mockRejectedValue(error);

      await pointerSqlService.getPointersByUserID(userID, sessionID, language, mockNext);

      expect(mockNext).toHaveBeenCalledWith("Something went wrong");
    });
  });
});

