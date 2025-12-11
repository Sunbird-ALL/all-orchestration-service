import { Request, Response } from 'express';
import pointerController from '../../src/mongo_module/modules/point/point.controller';
import pointerServices from '../../src/mongo_module/modules/point/point.services';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
  createSuccessServiceCallback,
  createErrorServiceCallback,
  createExceptionServiceCallback,
  expectControllerSuccess,
  expectControllerError,
} from '../helpers/test-utils';

jest.mock('../../src/mongo_module/modules/point/point.services');

describe('pointerController (MongoDB)', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let statusSpy: jest.Mock;
  let sendSpy: jest.Mock;

  beforeEach(() => {
    const responseMocks = createMockResponse();
    mockResponse = responseMocks.mockResponse;
    statusSpy = responseMocks.statusSpy;
    sendSpy = responseMocks.sendSpy;
    mockNext = createMockNext();
    mockRequest = createMockRequest();
    (mockResponse as any).locals = { virtual_id: '123' };
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

      expectControllerError(statusSpy);
    });

    it('should successfully add a point', async () => {
      const pointData = { 
        sessionId: 'session123',
        language: 'en',
        milestone: 'milestone1',
        points: 100
      };
      mockRequest.body = pointData;

      (pointerServices.addPoint as jest.Mock).mockImplementation(
        createSuccessServiceCallback({ id: '123', ...pointData })
      );

      await pointerController.addPoint(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerSuccess(statusSpy, sendSpy);
      expect(pointerServices.addPoint).toHaveBeenCalledWith(
        expect.objectContaining({ userId: '123' }),
        expect.any(Function)
      );
    });

    it('should return 400 on service error', async () => {
      mockRequest.body = { points: 100 };

      (pointerServices.addPoint as jest.Mock).mockImplementation(
        createErrorServiceCallback('Database error')
      );

      await pointerController.addPoint(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
    });

    it('should handle exceptions', async () => {
      mockRequest.body = {};

      (pointerServices.addPoint as jest.Mock).mockImplementation(
        createExceptionServiceCallback('Unexpected error')
      );

      await pointerController.addPoint(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
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

      expectControllerError(statusSpy);
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

      expectControllerSuccess(statusSpy, sendSpy);
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

      expectControllerError(statusSpy);
    });

    it('should handle exceptions', async () => {
      mockRequest.params = { sessionId: 'session123' };
      mockRequest.query = { language: 'en' };

      (pointerServices.getPointsByUserID as jest.Mock).mockImplementation(
        createExceptionServiceCallback('Unexpected error')
      );

      await pointerController.getPointsByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
    });
  });
});


