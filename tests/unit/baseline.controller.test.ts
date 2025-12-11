import { Request, Response } from 'express';
import BaselineController from '../../src/mongo_module/modules/baseline_assessment/baseline.controller';
import BaselineService from '../../src/mongo_module/modules/baseline_assessment/baseline.service';
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
} from '../helpers/test-utils';

jest.mock('../../src/mongo_module/modules/baseline_assessment/baseline.service');

describe('BaselineController', () => {
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
    jest.clearAllMocks();
  });

  describe('addBaseline', () => {
    it('should successfully add baseline assessment', async () => {
      const baselineData = { studentId: '123', assessmentId: '456', score: 85 };
      mockRequest.body = baselineData;

      (BaselineService.addBaseline as jest.Mock).mockImplementation(
        createSuccessServiceCallback({ id: '123', ...baselineData })
      );

      await BaselineController.addBaseline(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerSuccess(statusSpy, sendSpy);
    });

    it('should call next with error on service error', async () => {
      mockRequest.body = { studentId: '123' };

      (BaselineService.addBaseline as jest.Mock).mockImplementation(
        createErrorServiceCallback('Database error')
      );

      await BaselineController.addBaseline(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
    });

    it('should handle exceptions', async () => {
      mockRequest.body = {};

      (BaselineService.addBaseline as jest.Mock).mockImplementation(
        createExceptionServiceCallback('Unexpected error')
      );

      await BaselineController.addBaseline(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });

  describe('getBaseline', () => {
    it('should return baseline assessment data', async () => {
      mockRequest.params = { studentId: '123', assessment_id: '456' };

      (BaselineService.getBaseline as jest.Mock).mockImplementation(
        (studentId: string, assessmentId: string, callback: CallableFunction) => {
          callback(null, { studentId, assessmentId, score: 85 });
        }
      );

      await BaselineController.getBaseline(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerSuccess(statusSpy, sendSpy);
      expect(BaselineService.getBaseline).toHaveBeenCalledWith(
        '123',
        '456',
        expect.any(Function)
      );
    });

    it('should call next with error on service error', async () => {
      mockRequest.params = { studentId: '123', assessment_id: '456' };

      (BaselineService.getBaseline as jest.Mock).mockImplementation(
        (studentId: string, assessmentId: string, callback: CallableFunction) => {
          callback(new Error('Not found'), null);
        }
      );

      await BaselineController.getBaseline(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
    });

    it('should handle exceptions', async () => {
      mockRequest.params = { studentId: '123', assessment_id: '456' };

      (BaselineService.getBaseline as jest.Mock).mockImplementation(
        createExceptionServiceCallback('Unexpected error')
      );

      await BaselineController.getBaseline(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });
});


