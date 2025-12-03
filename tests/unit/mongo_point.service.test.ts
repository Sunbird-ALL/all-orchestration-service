import pointerServices from "../../src/mongo_module/modules/point/point.services";
import CrudOperations from "../../src/common/crud";
import Pointer from "../../src/mongo_module/models/pointer";

// Mock CrudOperations
jest.mock("../../src/common/crud");
jest.mock("../../src/mongo_module/models/pointer", () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe("pointerServices", () => {
  let mockCrudOperations: jest.Mocked<CrudOperations>;
  let mockNext: jest.Mock;
  let mockPointerInstance: any;

  beforeEach(() => {
    mockNext = jest.fn();
    mockPointerInstance = {
      toObject: jest.fn().mockReturnValue({}),
    };

    mockCrudOperations = {
      save: jest.fn(),
      getAllDocuments: jest.fn(),
    } as any;

    (CrudOperations as jest.MockedClass<typeof CrudOperations>).mockImplementation(
      () => mockCrudOperations
    );
    (Pointer as jest.MockedClass<typeof Pointer>).mockImplementation(
      () => mockPointerInstance
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("addPoint", () => {
    it("should successfully add a point and calculate totals", async () => {
      const pointer = {
        userId: "user123",
        sessionId: "session123",
        language: "en",
        points: 10,
      };

      const savedPointer = {
        ...pointer,
        _id: "123",
        toObject: jest.fn().mockReturnValue({ ...pointer, _id: "123" }),
      };

      mockCrudOperations.save.mockResolvedValue(savedPointer);
      mockCrudOperations.getAllDocuments
        .mockResolvedValueOnce([{ points: 10 }, { points: 20 }]) // user pointers
        .mockResolvedValueOnce([{ points: 10 }, { points: 15 }]) // session pointers
        .mockResolvedValueOnce([{ points: 10 }, { points: 5 }]); // language pointers

      await pointerServices.addPoint(pointer, mockNext);

      expect(mockCrudOperations.save).toHaveBeenCalled();
      expect(mockCrudOperations.getAllDocuments).toHaveBeenCalledTimes(3);
      expect(mockNext).toHaveBeenCalledWith(null, {
        ...pointer,
        _id: "123",
        totalUserPoints: 30,
        totalSessionPoints: 25,
        totalLanguagePoints: 15,
      });
    });

    it("should handle zero points correctly", async () => {
      const pointer = {
        userId: "user123",
        sessionId: "session123",
        language: "en",
        points: 0,
      };

      const savedPointer = {
        ...pointer,
        _id: "123",
        toObject: jest.fn().mockReturnValue({ ...pointer, _id: "123" }),
      };

      mockCrudOperations.save.mockResolvedValue(savedPointer);
      mockCrudOperations.getAllDocuments.mockResolvedValue([]);

      await pointerServices.addPoint(pointer, mockNext);

      expect(mockNext).toHaveBeenCalledWith(null, {
        ...pointer,
        _id: "123",
        totalUserPoints: 0,
        totalSessionPoints: 0,
        totalLanguagePoints: 0,
      });
    });

    it("should handle errors when adding point", async () => {
      const pointer = {
        userId: "user123",
        sessionId: "session123",
        language: "en",
        points: 10,
      };

      const error = new Error("Database error");
      mockCrudOperations.save.mockRejectedValue(error);

      await pointerServices.addPoint(pointer, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });

  describe("getPointsByUserID", () => {
    it("should return points with totals", async () => {
      const userID = "user123";
      const sessionID = "session123";
      const language = "en";

      const userPoints = [{ points: 10 }, { points: 20 }];
      const languagePoints = [{ points: 10 }, { points: 5 }];
      const sessionPoints = [{ points: 10 }, { points: 15 }];

      mockCrudOperations.getAllDocuments
        .mockResolvedValueOnce(userPoints)
        .mockResolvedValueOnce(languagePoints)
        .mockResolvedValueOnce(sessionPoints);

      await pointerServices.getPointsByUserID(userID, sessionID, language, mockNext);

      expect(mockCrudOperations.getAllDocuments).toHaveBeenCalledTimes(3);
      expect(mockNext).toHaveBeenCalledWith(null, {
        userID,
        totalUserPoints: 30,
        totalLanguagePoints: 15,
        totalSessionPoints: 25,
        result: userPoints,
      });
    });

    it("should handle empty results", async () => {
      const userID = "user123";
      const sessionID = "session123";
      const language = "en";

      mockCrudOperations.getAllDocuments.mockResolvedValue([]);

      await pointerServices.getPointsByUserID(userID, sessionID, language, mockNext);

      expect(mockNext).toHaveBeenCalledWith(null, {
        userID,
        totalUserPoints: 0,
        totalLanguagePoints: 0,
        totalSessionPoints: 0,
        result: [],
      });
    });

    it("should handle errors when getting points", async () => {
      const userID = "user123";
      const sessionID = "session123";
      const language = "en";
      const error = new Error("Database error");

      mockCrudOperations.getAllDocuments.mockRejectedValue(error);

      await pointerServices.getPointsByUserID(userID, sessionID, language, mockNext);

      expect(mockNext).toHaveBeenCalledWith("Something went wrong");
    });
  });
});

