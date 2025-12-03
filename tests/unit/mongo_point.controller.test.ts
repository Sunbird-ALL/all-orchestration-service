import { Request, Response } from 'express';
import pointerController from '../../src/mongo_module/modules/point/point.controller';
import pointerServices from '../../src/mongo_module/modules/point/point.services';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';

jest.mock('../../src/mongo_module/modules/point/point.services');

describe('pointerController (MongoDB)', () => {
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
      locals: { virtual_id: '123' },
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('addPoint', () => {
    it('should return 400 if validation fails', async () => {
      mockRequest.body = {};

      await pointerController.addPoint(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should successfully add a point', async () => {
      mockRequest.body = { 
        sessionId: 'session123',
        language: 'en',
        milestone: 'milestone1',
        points: 100
      };

      (pointerServices.addPoint as jest.Mock).mockImplementation(
        (pointer: any, callback: CallableFunction) => {
          callback(null, { id: '123', ...pointer });
        }
      );

      await pointerController.addPoint(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(pointerServices.addPoint).toHaveBeenCalledWith(
        expect.objectContaining({ userId: '123' }),
        expect.any(Function)
      );
    });

    it('should return 400 on service error', async () => {
      mockRequest.body = { points: 100 };

      (pointerServices.addPoint as jest.Mock).mockImplementation(
        (pointer: any, callback: CallableFunction) => {
          callback(new Error('Database error'), null);
        }
      );

      await pointerController.addPoint(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle exceptions', async () => {
      mockRequest.body = {};

      (pointerServices.addPoint as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await pointerController.addPoint(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getPointsByUserId', () => {
    it('should return 400 if validation fails', async () => {
      mockRequest.params = {};
      mockRequest.query = {};

      await pointerController.getPointsByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return points for user', async () => {
      mockRequest.params = { sessionId: 'session123' };
      mockRequest.query = { language: 'en' };

      (pointerServices.getPointsByUserID as jest.Mock).mockImplementation(
        (userId: string, sessionId: string, language: string, callback: CallableFunction) => {
          callback(null, { totalPoints: 500 });
        }
      );

      await pointerController.getPointsByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(pointerServices.getPointsByUserID).toHaveBeenCalledWith(
        '123',
        'session123',
        'en',
        expect.any(Function)
      );
    });

    it('should return 400 on service error', async () => {
      mockRequest.params = { sessionId: 'session123' };
      mockRequest.query = { language: 'en' };

      (pointerServices.getPointsByUserID as jest.Mock).mockImplementation(
        (userId: string, sessionId: string, language: string, callback: CallableFunction) => {
          callback(new Error('Not found'), null);
        }
      );

      await pointerController.getPointsByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle exceptions', async () => {
      mockRequest.params = { sessionId: 'session123' };
      mockRequest.query = { language: 'en' };

      (pointerServices.getPointsByUserID as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await pointerController.getPointsByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});


