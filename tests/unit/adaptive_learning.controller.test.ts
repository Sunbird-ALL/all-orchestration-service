import { Request, Response } from 'express';
import AdaptiveLearningController from '../../src/mongo_module/modules/adaptiveLearning/adaptive_learning.controller';
import AdaptiveLearningServices from '../../src/mongo_module/modules/adaptiveLearning/adaptive_learning.service';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';

jest.mock('../../src/mongo_module/modules/adaptiveLearning/adaptive_learning.service');

describe('AdaptiveLearningController', () => {
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

  describe('addSchoolUdise', () => {
    it('should return 400 if validation fails', async () => {
      mockRequest.body = {};

      await AdaptiveLearningController.addSchoolUdise(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should successfully add school UDISE', async () => {
      mockRequest.body = { udise_code: '123456', school_name: 'Test School' };

      (AdaptiveLearningServices.addSchoolUdise as jest.Mock).mockImplementation(
        (data: any, callback: CallableFunction) => {
          callback(null, { id: '123', ...data });
        }
      );

      await AdaptiveLearningController.addSchoolUdise(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 on service error', async () => {
      mockRequest.body = { udiseCode: '123456' };

      (AdaptiveLearningServices.addSchoolUdise as jest.Mock).mockImplementation(
        (data: any, callback: CallableFunction) => {
          callback(new Error('Database error'), null);
        }
      );

      await AdaptiveLearningController.addSchoolUdise(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateUdise', () => {
    it('should return 400 if validation fails', async () => {
      mockRequest.params = {};

      await AdaptiveLearningController.validateUdise(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return school data for valid UDISE code', async () => {
      mockRequest.params = { udise_code: '123456' };

      (AdaptiveLearningServices.validateUdise as jest.Mock).mockImplementation(
        (udiseCode: string, callback: CallableFunction) => {
          callback(null, { udiseCode, schoolName: 'Test School' });
        }
      );

      await AdaptiveLearningController.validateUdise(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteUdise', () => {
    it('should return 400 if validation fails', async () => {
      mockRequest.params = {};

      await AdaptiveLearningController.deleteUdise(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should successfully delete UDISE code', async () => {
      mockRequest.params = { udise_code: '123456' };

      (AdaptiveLearningServices.deleteUdise as jest.Mock).mockImplementation(
        (udiseCode: string, callback: CallableFunction) => {
          callback(null, { deleted: true });
        }
      );

      await AdaptiveLearningController.deleteUdise(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getAllUdeise', () => {
    it('should return all UDISE codes', async () => {
      (AdaptiveLearningServices.getAllUdeise as jest.Mock).mockImplementation(
        (callback: CallableFunction) => {
          callback(null, [{ udiseCode: '123456' }, { udiseCode: '789012' }]);
        }
      );

      await AdaptiveLearningController.getAllUdeise(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 on service error', async () => {
      (AdaptiveLearningServices.getAllUdeise as jest.Mock).mockImplementation(
        (callback: CallableFunction) => {
          callback(new Error('Database error'), null);
        }
      );

      await AdaptiveLearningController.getAllUdeise(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});


