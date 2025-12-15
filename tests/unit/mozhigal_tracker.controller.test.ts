import { Request, Response } from 'express';
import MozhigalTrackerController from '../../src/mongo_module/modules/mozhigal_tracker/mozhigal_tracker.controller';
import MozhigalTrackerServices from '../../src/mongo_module/modules/mozhigal_tracker/mozhigal_tracker.service';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';
import { setupSimpleControllerTest, mockServiceSuccess, mockServiceError } from '../helpers/test-utils';

jest.mock('../../src/mongo_module/modules/mozhigal_tracker/mozhigal_tracker.service');

describe('MozhigalTrackerController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    const mocks = setupSimpleControllerTest({ withVirtualId: true });
    mockRequest = mocks.mockRequest;
    mockResponse = mocks.mockResponse;
    mockNext = mocks.mockNext;
  });

  describe('addLearningLogs', () => {
    it('should return 400 if validation fails', async () => {
      mockRequest.body = {};
      mockRequest.params = {};

      await MozhigalTrackerController.addLearningLogs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle score at maximum value (100)', async () => {
      mockRequest.body = { score: 100 };
      mockRequest.params = { lessonId: '456' };

      mockServiceSuccess(MozhigalTrackerServices, 'addLearningLogs', { id: '123', score: 100 });

      await MozhigalTrackerController.addLearningLogs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async callback
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(MozhigalTrackerServices.addLearningLogs).toHaveBeenCalledWith(
        expect.objectContaining({ score: 100 }),
        '456',
        '123',
        expect.any(Function)
      );
    });

    it('should handle score at minimum value (0)', async () => {
      mockRequest.body = { score: 0 };
      mockRequest.params = { lessonId: '456' };

      mockServiceSuccess(MozhigalTrackerServices, 'addLearningLogs', { id: '123', score: 0 });

      await MozhigalTrackerController.addLearningLogs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async callback
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(MozhigalTrackerServices.addLearningLogs).toHaveBeenCalledWith(
        expect.objectContaining({ score: 0 }),
        '456',
        '123',
        expect.any(Function)
      );
    });

    it('should successfully add learning logs', async () => {
      mockRequest.body = { score: 85 };
      mockRequest.params = { lessonId: '456' };

      mockServiceSuccess(MozhigalTrackerServices, 'addLearningLogs', { id: '123', ...mockRequest.body });

      await MozhigalTrackerController.addLearningLogs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Wait for async callback
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockResponse.status).toHaveBeenCalledWith(200);

      mockServiceSuccess(MozhigalTrackerServices, 'addLearningLogs', { id: '123', ...mockRequest.body });

      await MozhigalTrackerController.addLearningLogs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 on service error', async () => {
      mockRequest.body = { score: 85 };
      mockRequest.params = { lessonId: '456' };

      mockServiceError(MozhigalTrackerServices, 'addLearningLogs', 'Database error');

      await MozhigalTrackerController.addLearningLogs(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getCumulativeScore', () => {
    it('should return 400 if validation fails', async () => {
      mockResponse.locals = {};

      await MozhigalTrackerController.getCumulativeScore(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return cumulative score', async () => {
      mockServiceSuccess(MozhigalTrackerServices, 'getCumulativeScore', { cumulativeScore: 450 });

      await MozhigalTrackerController.getCumulativeScore(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(MozhigalTrackerServices.getCumulativeScore).toHaveBeenCalledWith(
        '123',
        expect.any(Function)
      );
    });

    it('should return 400 on service error', async () => {
      mockServiceError(MozhigalTrackerServices, 'getCumulativeScore', 'Not found');

      await MozhigalTrackerController.getCumulativeScore(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getLessonWiseScore', () => {
    it('should return 400 if validation fails', async () => {
      mockResponse.locals = {};

      await MozhigalTrackerController.getLessonWiseScore(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return lesson-wise scores', async () => {
      mockServiceSuccess(MozhigalTrackerServices, 'getLessonWiseScore', [{ lessonId: '1', score: 85 }, { lessonId: '2', score: 90 }]);

      await MozhigalTrackerController.getLessonWiseScore(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(MozhigalTrackerServices.getLessonWiseScore).toHaveBeenCalledWith(
        '123',
        expect.any(Function)
      );
    });

    it('should return 400 on service error', async () => {
      mockServiceError(MozhigalTrackerServices, 'getLessonWiseScore', 'Not found');

      await MozhigalTrackerController.getLessonWiseScore(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});


