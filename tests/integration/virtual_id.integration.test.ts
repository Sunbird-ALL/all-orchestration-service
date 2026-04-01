/**
 * Integration tests for Virtual ID module
 * These tests verify the interaction between controller and service layers
 * Note: These tests use mocks but simulate integration behavior
 */

import { Request, Response } from 'express';
import virtualIdSqlController from '../../src/sql_module/module/virtual_Id_Module/virtual_id.controller';
import virtualIdSqlSqlService from '../../src/sql_module/module/virtual_Id_Module/virtual_id.service';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';

// Mock the service for integration testing
jest.mock('../../src/sql_module/module/virtual_Id_Module/virtual_id.service');

describe('Virtual ID Module Integration Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('End-to-End Flow', () => {
    it('should complete full flow: request -> controller -> service -> response', async () => {
      const username = 'integrationtest';
      const mockVirtualID = 1234567890;
      const mockServiceResult = { virtualID: mockVirtualID };

      mockRequest.query = { username };

      // Mock service to simulate successful execution
      (virtualIdSqlSqlService.genarateId as jest.Mock).mockImplementation(
        (user: string, callback: CallableFunction) => {
          // Simulate async service call
          setTimeout(() => {
            callback(null, mockServiceResult);
          }, 0);
        }
      );

      await virtualIdSqlController.genarateVirtualId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async callback
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify controller called service
      expect(virtualIdSqlSqlService.genarateId).toHaveBeenCalledWith(
        username,
        expect.any(Function)
      );

      // Verify response was sent
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.any(HttpResponse)
      );

      // Verify response content
      const response = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(response.result).toEqual(mockServiceResult);
    });

    it('should handle error flow: request -> controller -> service error -> error response', async () => {
      const username = 'errortest';
      const mockError = new Error('Service error');

      mockRequest.query = { username };

      (virtualIdSqlSqlService.genarateId as jest.Mock).mockImplementation(
        (user: string, callback: CallableFunction) => {
          callback(mockError, null);
        }
      );

      await virtualIdSqlController.genarateVirtualId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.any(HttpException)
      );
    });
  });

  describe('Data Flow Validation', () => {
    it('should pass username correctly through all layers', async () => {
      const testUsername = 'datatest';
      mockRequest.query = { username: testUsername };

      let receivedUsername: string | undefined;

      (virtualIdSqlSqlService.genarateId as jest.Mock).mockImplementation(
        (username: string, callback: CallableFunction) => {
          receivedUsername = username;
          callback(null, { virtualID: 1234567890 });
        }
      );

      await virtualIdSqlController.genarateVirtualId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(receivedUsername).toBe(testUsername);
    });

    it('should return service result in response', async () => {
      const username = 'resulttest';
      const serviceResult = { virtualID: 9999999999 };

      mockRequest.query = { username };

      (virtualIdSqlSqlService.genarateId as jest.Mock).mockImplementation(
        (user: string, callback: CallableFunction) => {
          callback(null, serviceResult);
        }
      );

      await virtualIdSqlController.genarateVirtualId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const response = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(response.result).toEqual(serviceResult);
    });
  });

  describe('Error Propagation', () => {
    it('should propagate service errors to controller', async () => {
      const username = 'errortest';
      const serviceError = new Error('Database connection failed');

      mockRequest.query = { username };

      (virtualIdSqlSqlService.genarateId as jest.Mock).mockImplementation(
        (user: string, callback: CallableFunction) => {
          callback(serviceError, null);
        }
      );

      await virtualIdSqlController.genarateVirtualId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const exception = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(exception).toBeInstanceOf(HttpException);
    });

    it('should handle exceptions thrown during service call', async () => {
      const username = 'exceptiontest';
      mockRequest.query = { username };

      (virtualIdSqlSqlService.genarateId as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected exception');
      });

      await virtualIdSqlController.genarateVirtualId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Response Format Consistency', () => {
    it('should maintain consistent success response format', async () => {
      const username = 'formattest';
      mockRequest.query = { username };

      (virtualIdSqlSqlService.genarateId as jest.Mock).mockImplementation(
        (user: string, callback: CallableFunction) => {
          callback(null, { virtualID: 1234567890 });
        }
      );

      await virtualIdSqlController.genarateVirtualId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const response = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(response).toBeInstanceOf(HttpResponse);
      expect(response).toHaveProperty('query');
      expect(response).toHaveProperty('result');
      expect(response).toHaveProperty('message');
      expect(response).toHaveProperty('error');
    });

    it('should maintain consistent error response format', async () => {
      mockRequest.query = {};

      await virtualIdSqlController.genarateVirtualId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const exception = (mockResponse.send as jest.Mock).mock.calls[0][0];
      expect(exception).toBeInstanceOf(HttpException);
      expect(exception).toHaveProperty('status');
      expect(exception).toHaveProperty('message');
    });
  });
});

