import { Request, Response } from 'express';
import virtualIdSqlController from '../../src/sql_module/module/virtual_Id_Module/virtual_id.controller';
import virtualIdSqlSqlService from '../../src/sql_module/module/virtual_Id_Module/virtual_id.service';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';
import { setupSimpleControllerTest, mockServiceSuccess, mockServiceError } from '../helpers/test-utils';

// Mock the service
jest.mock('../../src/sql_module/module/virtual_Id_Module/virtual_id.service');

describe('virtualIdSqlController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    const mocks = setupSimpleControllerTest();
    mockRequest = mocks.mockRequest;
    mockResponse = mocks.mockResponse;
    mockNext = mocks.mockNext;
  });

  describe('genarateVirtualId', () => {
    describe('Input Validation', () => {
      it('should return 400 if username is missing from query', async () => {
        mockRequest.query = {};

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith(
          expect.any(HttpException)
        );
        const exception = (mockResponse.send as jest.Mock).mock.calls[0][0];
        expect(exception.message).toBe('Username and password are required');
        expect(virtualIdSqlSqlService.genarateId).not.toHaveBeenCalled();
      });

      it('should return 400 if username is undefined', async () => {
        mockRequest.query = { username: undefined };

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(virtualIdSqlSqlService.genarateId).not.toHaveBeenCalled();
      });

      it('should return 400 if username is null', async () => {
        mockRequest.query = { username: null as any };

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(virtualIdSqlSqlService.genarateId).not.toHaveBeenCalled();
      });

      it('should return 400 if username is empty string', async () => {
        mockRequest.query = { username: '' };

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(virtualIdSqlSqlService.genarateId).not.toHaveBeenCalled();
      });
    });

    describe('Success Scenarios', () => {
      it('should successfully generate virtual ID for new user', async () => {
        const mockUsername = 'newuser';
        const mockResult = { virtualID: 1234567890 };
        
        mockRequest.query = { username: mockUsername };
        
        mockServiceSuccess(virtualIdSqlSqlService, 'genarateId', mockResult);

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(virtualIdSqlSqlService.genarateId).toHaveBeenCalledWith(
          mockUsername,
          expect.any(Function)
        );
        expect(virtualIdSqlSqlService.genarateId).toHaveBeenCalledTimes(1);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
          expect.any(HttpResponse)
        );
        
        const response = (mockResponse.send as jest.Mock).mock.calls[0][0];
        expect(response).toBeInstanceOf(HttpResponse);
        expect(response.result).toEqual(mockResult);
        expect(response.message).toBe('Virtual_id generated');
      });

      it('should return existing virtual ID for existing user', async () => {
        const mockUsername = 'existinguser';
        const mockResult = { virtualID: '9876543210' };
        
        mockRequest.query = { username: mockUsername };
        
        mockServiceSuccess(virtualIdSqlSqlService, 'genarateId', mockResult);

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        const response = (mockResponse.send as jest.Mock).mock.calls[0][0];
        expect(response.result).toEqual(mockResult);
      });

      it('should handle username with different cases', async () => {
        const mockUsername = 'TestUser123';
        const mockResult = { virtualID: 5555555555 };
        
        mockRequest.query = { username: mockUsername };
        
        mockServiceSuccess(virtualIdSqlSqlService, 'genarateId', mockResult);

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(virtualIdSqlSqlService.genarateId).toHaveBeenCalledWith(
          mockUsername,
          expect.any(Function)
        );
        expect(mockResponse.status).toHaveBeenCalledWith(200);
      });

      it('should handle username with special characters', async () => {
        const mockUsername = 'user_name-123';
        const mockResult = { virtualID: 1111111111 };
        
        mockRequest.query = { username: mockUsername };
        
        mockServiceSuccess(virtualIdSqlSqlService, 'genarateId', mockResult);

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(200);
      });
    });

    describe('Error Scenarios', () => {
      it('should return 400 when service returns an error', async () => {
        const mockUsername = 'testuser';
        const mockError = new Error('Database connection failed');
        
        mockRequest.query = { username: mockUsername };
        
        mockServiceError(virtualIdSqlSqlService, 'genarateId', 'Database connection failed');

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith(
          expect.any(HttpException)
        );
        const exception = (mockResponse.send as jest.Mock).mock.calls[0][0];
        expect(exception.message).toBe('Something went wrong');
        expect(exception.status).toBe(400);
      });

      it('should handle service callback with error object', async () => {
        const mockUsername = 'testuser';
        const mockError = { code: 'DB_ERROR', message: 'Query failed' };
        
        mockRequest.query = { username: mockUsername };
        
        mockServiceError(virtualIdSqlSqlService, 'genarateId', 'Token generation failed');

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });

      it('should handle exceptions thrown in try block', async () => {
        mockRequest.query = { username: 'testuser' };
        
        (virtualIdSqlSqlService.genarateId as jest.Mock).mockImplementation(() => {
          throw new Error('Unexpected error');
        });

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

      it('should handle TypeError when accessing request.query', async () => {
        mockRequest.query = null as any;

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
      });
    });

    describe('Response Format', () => {
      it('should return HttpResponse with correct structure on success', async () => {
        const mockUsername = 'testuser';
        const mockResult = { virtualID: 1234567890 };
        
        mockRequest.query = { username: mockUsername };
        
        mockServiceSuccess(virtualIdSqlSqlService, 'genarateId', mockResult);

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        const response = (mockResponse.send as jest.Mock).mock.calls[0][0];
        expect(response).toBeInstanceOf(HttpResponse);
        expect(response.query).toBeNull();
        expect(response.result).toEqual(mockResult);
        expect(response.message).toBe('Virtual_id generated');
        expect(response.error).toBeNull();
      });

      it('should return HttpException with correct structure on error', async () => {
        mockRequest.query = {};

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        const exception = (mockResponse.send as jest.Mock).mock.calls[0][0];
        expect(exception).toBeInstanceOf(HttpException);
        expect(exception.status).toBe(400);
        expect(exception.message).toBe('Username and password are required');
      });
    });

    describe('Service Integration', () => {
      it('should pass username exactly as received to service', async () => {
        const mockUsername = 'exactUsername';
        mockRequest.query = { username: mockUsername };
        
        (virtualIdSqlSqlService.genarateId as jest.Mock).mockImplementation(
          (username: string, callback: CallableFunction) => {
            callback(null, { virtualID: 1234567890 });
          }
        );

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(virtualIdSqlSqlService.genarateId).toHaveBeenCalledWith(
          mockUsername,
          expect.any(Function)
        );
      });

      it('should handle async callback execution', async () => {
        const mockUsername = 'testuser';
        mockRequest.query = { username: mockUsername };
        
        (virtualIdSqlSqlService.genarateId as jest.Mock).mockImplementation(
          (username: string, callback: CallableFunction) => {
            // Simulate async operation with setTimeout
            setTimeout(() => {
              callback(null, { virtualID: 1234567890 });
            }, 10);
          }
        );

        await virtualIdSqlController.genarateVirtualId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        // Wait for callback to execute
        await new Promise(resolve => setTimeout(resolve, 20));

        expect(mockResponse.status).toHaveBeenCalledWith(200);
      });
    });
  });
});

