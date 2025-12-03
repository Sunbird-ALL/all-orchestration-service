import { Request, Response } from 'express';
import BaselineController from '../../src/mongo_module/modules/baseline_assessment/baseline.controller';
import BaselineService from '../../src/mongo_module/modules/baseline_assessment/baseline.service';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';

jest.mock('../../src/mongo_module/modules/baseline_assessment/baseline.service');

describe('BaselineController', () => {
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

  describe('addBaseline', () => {
    it('should successfully add baseline assessment', async () => {
      mockRequest.body = { studentId: '123', assessmentId: '456', score: 85 };

      (BaselineService.addBaseline as jest.Mock).mockImplementation(
        (data: any, callback: CallableFunction) => {
          callback(null, { id: '123', ...data });
        }
      );

      await BaselineController.addBaseline(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(expect.any(HttpResponse));
    });

    it('should call next with error on service error', async () => {
      mockRequest.body = { studentId: '123' };

      (BaselineService.addBaseline as jest.Mock).mockImplementation(
        (data: any, callback: CallableFunction) => {
          callback(new Error('Database error'), null);
        }
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

      (BaselineService.addBaseline as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

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

      expect(mockResponse.status).toHaveBeenCalledWith(200);
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

      (BaselineService.getBaseline as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await BaselineController.getBaseline(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });
});


