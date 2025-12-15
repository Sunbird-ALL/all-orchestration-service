import { Request, Response } from 'express';
import LearnerProgressController from '../../src/mongo_module/modules/learner_progress/learner_progress.controller';
import learnerProgressServices from '../../src/mongo_module/modules/learner_progress/learner_progress.services';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';
import { setupSimpleControllerTest } from '../helpers/test-utils';

jest.mock('../../src/mongo_module/modules/learner_progress/learner_progress.services');

describe('LearnerProgressController (MongoDB)', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    const mocks = setupSimpleControllerTest({ withVirtualId: true });
    mockRequest = mocks.mockRequest;
    mockResponse = mocks.mockResponse;
    mockNext = mocks.mockNext;
  });

  describe('createLearnerProgress', () => {
    it('should return 400 if validation fails', async () => {
      mockRequest.body = {};

      await LearnerProgressController.createLearnerProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should successfully create learner progress', async () => {
      mockRequest.body = { 
        sessionId: 'session123', 
        subSessionId: 'subsession123', 
        language: 'en', 
        milestoneLevel: 'level1' 
      };

      (learnerProgressServices.createLearnerProgress as jest.Mock).mockImplementation(
        (data: any, callback: CallableFunction) => {
          callback(null, { id: '123', ...data });
        }
      );

      await LearnerProgressController.createLearnerProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(learnerProgressServices.createLearnerProgress).toHaveBeenCalledWith(
        expect.objectContaining({ userId: '123' }),
        expect.any(Function)
      );
    });

    it('should call next with error on service error', async () => {
      mockRequest.body = { 
        sessionId: 'session123', 
        subSessionId: 'subsession123', 
        language: 'en', 
        milestoneLevel: 'level1' 
      };

      (learnerProgressServices.createLearnerProgress as jest.Mock).mockImplementation(
        (data: any, callback: CallableFunction) => {
          callback(new Error('Database error'), null);
        }
      );

      await LearnerProgressController.createLearnerProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });

  describe('learnerProgressByuserId', () => {
    it('should return 400 if validation fails', async () => {
      mockRequest.query = {};

      await LearnerProgressController.learnerProgressByuserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return learner progress by user ID', async () => {
      mockRequest.query = { language: 'en' };

      (learnerProgressServices.getLessonProgress as jest.Mock).mockImplementation(
        (userId: string, language: string, callback: CallableFunction) => {
          callback(null, { totalProgress: 75 });
        }
      );

      await LearnerProgressController.learnerProgressByuserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(learnerProgressServices.getLessonProgress).toHaveBeenCalledWith(
        '123',
        'en',
        expect.any(Function)
      );
    });

    it('should call next with error on service error', async () => {
      mockRequest.query = { language: 'en' };

      (learnerProgressServices.getLessonProgress as jest.Mock).mockImplementation(
        (userId: string, language: string, callback: CallableFunction) => {
          callback(new Error('Not found'), null);
        }
      );

      await LearnerProgressController.learnerProgressByuserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(HttpException));
    });
  });
});


