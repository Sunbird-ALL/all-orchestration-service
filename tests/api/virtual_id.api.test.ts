import request from "supertest";
import express from "express";
import { createTestApp } from "./app.setup";
import virtualIdSqlSqlService from "../../src/sql_module/module/virtual_Id_Module/virtual_id.service";

// Mock database connections to avoid actual DB connections in tests
jest.mock("../../src/sql_module/config/data.config", () => ({
  myDataSource: {
    getRepository: jest.fn(),
  },
}));

// Mock the service
jest.mock(
  "../../src/sql_module/module/virtual_Id_Module/virtual_id.service",
  () => ({
    __esModule: true,
    default: {
      genarateId: jest.fn(),
    },
  })
);

describe("Virtual ID API Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Set up default mock implementation
    (virtualIdSqlSqlService.genarateId as jest.Mock).mockImplementation(
      (username: string, callback: CallableFunction) => {
        if (username === "erroruser") {
          callback(new Error("Database error"), null);
        } else {
          callback(null, { virtualID: "1234567890" });
        }
      }
    );
  });

  beforeAll(() => {
    app = createTestApp("mysql");
  });

  describe("POST /api/virtualId/generateVirtualID", () => {
    it("should return 400 if username is missing", async () => {
      const response = await request(app)
        .post("/api/virtualId/generateVirtualID")
        .expect(400);

      expect(response.body).toHaveProperty("status", 400);
      expect(response.body).toHaveProperty("message");
    });

    it("should successfully generate virtual ID", async () => {
      const response = await request(app)
        .post("/api/virtualId/generateVirtualID")
        .query({ username: "testuser" })
        .expect(200);

      expect(response.body).toHaveProperty("result");
      expect(response.body).toHaveProperty("message", "Virtual_id generated");
    });

    it("should handle service errors", async () => {
      const response = await request(app)
        .post("/api/virtualId/generateVirtualID")
        .query({ username: "erroruser" })
        .expect(400);

      expect(response.body).toHaveProperty("status", 400);
    });

    it("should handle empty username", async () => {
      const response = await request(app)
        .post("/api/virtualId/generateVirtualID")
        .query({ username: "" })
        .expect(400);

      expect(response.body).toHaveProperty("status", 400);
    });
  });

  describe("GET /ping", () => {
    it("should return health check status", async () => {
      const response = await request(app).get("/ping").expect(200);

      expect(response.body).toHaveProperty("status", true);
      expect(response.body).toHaveProperty("message", "App is working");
    });
  });
});
