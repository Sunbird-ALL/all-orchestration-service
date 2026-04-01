import CrudOperations from "../../src/common/crud";
import memoryCache from "../../src/common/cacheManager";

// Mock cacheManager
jest.mock("../../src/common/cacheManager", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe("CrudOperations", () => {
  let mockDbModel: any;
  let crudOperations: CrudOperations;

  beforeEach(() => {
    mockDbModel = {
      save: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateMany: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      deleteOne: jest.fn(),
      aggregate: jest.fn(),
    };
    crudOperations = new CrudOperations(mockDbModel);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("save", () => {
    it("should save a document", async () => {
      const obj = { name: "Test" };
      const savedDoc = { _id: "123", ...obj };
      const mockModelInstance = { save: jest.fn().mockResolvedValue(savedDoc) };

      // Mock the constructor to return an instance with save method
      const MockModel = jest.fn().mockImplementation(() => mockModelInstance);
      mockDbModel = MockModel;

      crudOperations = new CrudOperations(MockModel);
      const result = await crudOperations.save(obj);

      expect(MockModel).toHaveBeenCalledWith(obj);
      expect(mockModelInstance.save).toHaveBeenCalledWith(obj);
      expect(result).toEqual(savedDoc);
    });
  });

  describe("insertOrUpdate", () => {
    it("should insert or update a document", async () => {
      const query = { id: "123" };
      const document = { name: "Updated" };
      const result = { _id: "123", ...document };

      mockDbModel.findOneAndUpdate.mockResolvedValue(result);

      const actualResult = await crudOperations.insertOrUpdate(query, document);

      expect(mockDbModel.findOneAndUpdate).toHaveBeenCalledWith(
        query,
        document,
        { upsert: true, new: true }
      );
      expect(actualResult).toEqual(result);
    });
  });

  describe("updateManyDocuments", () => {
    it("should update many documents", async () => {
      const query = { status: "active" };
      const docs = { status: "inactive" };
      const options = {};

      mockDbModel.updateMany.mockResolvedValue({ modifiedCount: 5 });

      const result = await crudOperations.updateManyDocuments(query, docs, options);

      expect(mockDbModel.updateMany).toHaveBeenCalledWith(query, docs, options);
    });
  });

  describe("getDocument", () => {
    it("should get a document by query", async () => {
      const query = { id: "123" };
      const projections = { name: 1 };
      const result = { _id: "123", name: "Test" };

      mockDbModel.findOne.mockResolvedValue(result);

      const actualResult = await crudOperations.getDocument(query, projections);

      expect(mockDbModel.findOne).toHaveBeenCalledWith(query, projections);
      expect(actualResult).toEqual(result);
    });
  });

  describe("getDocumentById", () => {
    it("should get a document by ID", async () => {
      const id = "123";
      const projections = { name: 1 };
      const result = { _id: "123", name: "Test" };

      mockDbModel.findById.mockResolvedValue(result);

      const actualResult = await crudOperations.getDocumentById(id, projections);

      expect(mockDbModel.findById).toHaveBeenCalledWith(id, projections);
      expect(actualResult).toEqual(result);
    });
  });

  describe("getAllDocuments", () => {
    it("should get all documents with default sort", async () => {
      const query = {};
      const sort = null;
      const limit = null;
      const result = [{ _id: "1" }, { _id: "2" }];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(result),
      };
      mockDbModel.find.mockReturnValue(mockQuery);

      const actualResult = await crudOperations.getAllDocuments(query, sort, limit);

      expect(mockDbModel.find).toHaveBeenCalledWith(query);
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.limit).toHaveBeenCalledWith(limit);
      expect(actualResult).toEqual(result);
    });

    it("should get all documents with custom sort and limit", async () => {
      const query = { status: "active" };
      const sort = { name: 1 };
      const limit = 10;
      const result = [{ _id: "1" }];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(result),
      };
      mockDbModel.find.mockReturnValue(mockQuery);

      const actualResult = await crudOperations.getAllDocuments(query, sort, limit);

      expect(mockQuery.sort).toHaveBeenCalledWith(sort);
      expect(mockQuery.limit).toHaveBeenCalledWith(limit);
      expect(actualResult).toEqual(result);
    });
  });

  describe("countAllDocuments", () => {
    it("should count all documents", async () => {
      const query = { status: "active" };
      const result = 5;

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(result),
      };
      mockDbModel.countDocuments.mockReturnValue(mockQuery);

      const actualResult = await crudOperations.countAllDocuments(query);

      expect(mockDbModel.countDocuments).toHaveBeenCalledWith(query);
      expect(actualResult).toEqual(result);
    });
  });

  describe("updateDocument", () => {
    it("should update a document", async () => {
      const query = { id: "123" };
      const doc = { name: "Updated" };
      const result = { _id: "123", ...doc };

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(result),
      };
      mockDbModel.findOneAndUpdate.mockReturnValue(mockQuery);

      const actualResult = await crudOperations.updateDocument(query, doc);

      expect(mockDbModel.findOneAndUpdate).toHaveBeenCalledWith(
        query,
        { $set: doc },
        { new: true }
      );
      expect(actualResult).toEqual(result);
    });
  });

  describe("updateOneDocument", () => {
    it("should update one document", async () => {
      const query = { id: "123" };
      const doc = { name: "Updated" };
      const result = { _id: "123", ...doc };

      const mockQuery = {
        lean: jest.fn().mockResolvedValue(result),
      };
      mockDbModel.findOneAndUpdate.mockReturnValue(mockQuery);

      const actualResult = await crudOperations.updateOneDocument(query, doc);

      expect(mockDbModel.findOneAndUpdate).toHaveBeenCalledWith(query, doc, {
        new: true,
      });
      expect(actualResult).toEqual(result);
    });
  });

  describe("deleteDocument", () => {
    it("should delete a document", async () => {
      const query = { id: "123" };
      const result = { deletedCount: 1 };

      mockDbModel.deleteOne.mockResolvedValue(result);

      const actualResult = await crudOperations.deleteDocument(query);

      expect(mockDbModel.deleteOne).toHaveBeenCalledWith(query);
      expect(actualResult).toEqual(result);
    });
  });

  describe("cummumulativeScoreDocument", () => {
    it("should get cumulative score document", async () => {
      const studentId = "student123";
      const result = [{ _id: "student123", totalScore: 250 }];

      mockDbModel.aggregate.mockResolvedValue(result);

      const actualResult = await crudOperations.cummumulativeScoreDocument(studentId);

      expect(mockDbModel.aggregate).toHaveBeenCalledWith([
        { $match: { student_id: studentId } },
        { $group: { _id: "$student_id", totalScore: { $sum: "$score" } } },
      ]);
      expect(actualResult).toEqual(result);
    });
  });

  describe("lessonWiseScoreDocument", () => {
    it("should get lesson-wise score document", async () => {
      const studentId = "student123";
      const result = [
        {
          lesson_master_id: "master123",
          score: 100,
          lesson_id: "lesson123",
        },
      ];

      mockDbModel.aggregate.mockResolvedValue(result);

      const actualResult = await crudOperations.lessonWiseScoreDocument(studentId);

      expect(mockDbModel.aggregate).toHaveBeenCalled();
      expect(actualResult).toEqual(result);
    });
  });

  describe("lessonScoreDocuments", () => {
    it("should get lesson score documents", async () => {
      const studentId = "student123";
      const result = [{ _id: "master123", totalScore: 100 }];

      mockDbModel.aggregate.mockResolvedValue(result);

      const actualResult = await crudOperations.lessonScoreDocuments(studentId);

      expect(mockDbModel.aggregate).toHaveBeenCalledWith([
        { $match: { student_id: studentId } },
        {
          $group: {
            _id: "$lesson_master_id",
            totalScore: { $sum: "$score" },
          },
        },
      ]);
      expect(actualResult).toEqual(result);
    });
  });

  describe("getAlllessonMasterDocuments", () => {
    it("should return cached lesson master documents", async () => {
      const cachedData = { master123: "lesson123" };
      (memoryCache.get as jest.Mock).mockResolvedValue(cachedData);

      const result = await crudOperations.getAlllessonMasterDocuments();

      expect(memoryCache.get).toHaveBeenCalledWith("lesson_master_data");
      expect(result).toEqual(cachedData);
      expect(mockDbModel.find).not.toHaveBeenCalled();
    });

    it("should fetch and cache lesson master documents if not cached", async () => {
      const lessonMasterData = [
        { lesson_master_id: "master123", lesson_id: "lesson123" },
        { lesson_master_id: "master456", lesson_id: "lesson456" },
      ];
      const expectedObj = {
        master123: "lesson123",
        master456: "lesson456",
      };

      (memoryCache.get as jest.Mock).mockResolvedValue(null);
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(lessonMasterData),
      };
      mockDbModel.find.mockReturnValue(mockQuery);
      (memoryCache.set as jest.Mock).mockResolvedValue(undefined);

      const result = await crudOperations.getAlllessonMasterDocuments();

      expect(memoryCache.get).toHaveBeenCalledWith("lesson_master_data");
      expect(mockDbModel.find).toHaveBeenCalledWith({});
      expect(memoryCache.set).toHaveBeenCalledWith(
        "lesson_master_data",
        expectedObj,
        60 * 100 * 100
      );
      expect(result).toEqual(expectedObj);
    });
  });
});

