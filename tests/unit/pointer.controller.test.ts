import { Request, Response } from 'express';
import pointerController from '../../src/sql_module/module/pointer_Module/pointerController';
import pointerSqlService from '../../src/sql_module/module/pointer_Module/pointerScrvice';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';

jest.mock('../../src/sql_module/module/pointer_Module/pointerScrvice');

describe('pointerController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('addPointer', () => {
    it('should successfully add a pointer', async () => {
      const mockPointer = { userId: '123', points: 100 };
      mockRequest.body = mockPointer;

      (pointerSqlService.addPointer as jest.Mock).mockImplementation(
        (pointer: any, callback: CallableFunction) => {
          callback(null, { id: 1, ...pointer });
        }
      );

      await pointerController.addPointer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(expect.any(HttpResponse));
    });

    it('should return 400 when service returns error', async () => {
      mockRequest.body = { userId: '123' };

      (pointerSqlService.addPointer as jest.Mock).mockImplementation(
        (pointer: any, callback: CallableFunction) => {
          callback(new Error('Database error'), null);
        }
      );

      await pointerController.addPointer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle exceptions', async () => {
      mockRequest.body = {};

      (pointerSqlService.addPointer as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await pointerController.addPointer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getPointersByUserId', () => {
    it('should return 400 if userId is null', async () => {
      mockRequest.params = { userId: 'null', sessionId: 'session123' };
      mockRequest.query = { language: 'en' };

      await pointerController.getPointersByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(pointerSqlService.getPointersByUserID).not.toHaveBeenCalled();
    });

    it('should return 400 if sessionId is null', async () => {
      mockRequest.params = { userId: 'user123', sessionId: 'null' };
      mockRequest.query = { language: 'en' };

      await pointerController.getPointersByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(pointerSqlService.getPointersByUserID).not.toHaveBeenCalled();
    });

    it('should return 400 if language is null', async () => {
      mockRequest.params = { userId: 'user123', sessionId: 'session123' };
      mockRequest.query = { language: 'null' };

      await pointerController.getPointersByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(pointerSqlService.getPointersByUserID).not.toHaveBeenCalled();
    });

    it('should return pointers when all parameters are valid', async () => {
      mockRequest.params = { userId: 'user123', sessionId: 'session123' };
      mockRequest.query = { language: 'en' };

      (pointerSqlService.getPointersByUserID as jest.Mock).mockImplementation(
        (userId: string, sessionId: string, language: string, callback: CallableFunction) => {
          callback(null, { totalPoints: 500 });
        }
      );

      await pointerController.getPointersByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(pointerSqlService.getPointersByUserID).toHaveBeenCalledWith(
        'user123',
        'session123',
        'en',
        expect.any(Function)
      );
    });

    it('should return 400 on service error', async () => {
      mockRequest.params = { userId: 'user123', sessionId: 'session123' };
      mockRequest.query = { language: 'en' };

      (pointerSqlService.getPointersByUserID as jest.Mock).mockImplementation(
        (userId: string, sessionId: string, language: string, callback: CallableFunction) => {
          callback(new Error('Not found'), null);
        }
      );

      await pointerController.getPointersByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle exceptions', async () => {
      mockRequest.params = { userId: 'user123', sessionId: 'session123' };
      mockRequest.query = { language: 'en' };

      (pointerSqlService.getPointersByUserID as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await pointerController.getPointersByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});


