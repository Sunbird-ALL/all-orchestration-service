import studentService from "../../src/mongo_module/modules/student/student.service";
import student from "../../src/mongo_module/models/student";

// Mock the student model
jest.mock("../../src/mongo_module/models/student", () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe("studentService", () => {
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should return existing user if user already exists", async () => {
      const userName = "testuser";
      const existingUser = {
        _id: "123",
        userName: "testuser",
        createdAt: new Date(),
      };

      (student.findOne as jest.Mock).mockResolvedValue(existingUser);

      await studentService.create(userName, mockNext);

      expect(student.findOne).toHaveBeenCalledWith({ userName: userName });
      expect(student.create).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(null, existingUser);
    });

    it("should create new user if user does not exist", async () => {
      const userName = "newuser";
      const newUser = {
        _id: "456",
        userName: "newuser",
        createdAt: new Date(),
      };

      (student.findOne as jest.Mock).mockResolvedValue(null);
      (student.create as jest.Mock).mockResolvedValue(newUser);

      await studentService.create(userName, mockNext);

      expect(student.findOne).toHaveBeenCalledWith({ userName: userName });
      expect(student.create).toHaveBeenCalledWith({ userName: userName });
      expect(mockNext).toHaveBeenCalledWith(null, newUser);
    });

    it("should handle errors when creating user", async () => {
      const userName = "testuser";
      const error = new Error("Database error");

      (student.findOne as jest.Mock).mockRejectedValue(error);

      await studentService.create(userName, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });

  describe("findUser", () => {
    it("should return user if found", async () => {
      const userName = "testuser";
      const foundUser = {
        _id: "123",
        userName: "testuser",
        createdAt: new Date(),
      };

      (student.findOne as jest.Mock).mockResolvedValue(foundUser);

      await studentService.findUser(userName, mockNext);

      expect(student.findOne).toHaveBeenCalledWith({ userName: userName });
      expect(mockNext).toHaveBeenCalledWith(null, foundUser);
    });

    it("should return null if user not found", async () => {
      const userName = "nonexistent";

      (student.findOne as jest.Mock).mockResolvedValue(null);

      await studentService.findUser(userName, mockNext);

      expect(student.findOne).toHaveBeenCalledWith({ userName: userName });
      expect(mockNext).toHaveBeenCalledWith(null, null);
    });

    it("should handle errors when finding user", async () => {
      const userName = "testuser";
      const error = new Error("Database error");

      (student.findOne as jest.Mock).mockRejectedValue(error);

      await studentService.findUser(userName, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error, "Something went wrong!");
    });
  });
});

