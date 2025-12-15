import { Request, Response } from 'express';
import learnerProgressSqlController from '../../src/sql_module/module/learner_progress_Module/learner_progress.controller';
import learnerProgressService from '../../src/sql_module/module/learner_progress_Module/learner_progress.service';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';
import { setupSimpleControllerTest } from '../helpers/test-utils';

jest.mock('../../src/sql_module/module/learner_progress_Module/learner_progress.service');

describe('learnerProgressSqlController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    const mocks = setupSimpleControllerTest();
    mockRequest = mocks.mockRequest;
    mockResponse = mocks.mockResponse;
    mockNext = mocks.mockNext;
  });

  describe('addLearnerProgress', () => {
    it('should successfully add learner progress', async () => {
      const mockProgress = { userId: '123', lessonId: '456', progress: 50 };
      mockRequest.body = mockProgress;

      (learnerProgressService.addlessonProgress as jest.Mock).mockImplementation(
        (data: any, callback: CallableFunction) => {
          callback(null, { id: 1, ...data });
        }
      );

      await learnerProgressSqlController.addLearnerProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(expect.any(HttpResponse));
    });

    it('should return 400 when service returns error', async () => {
      mockRequest.body = { userId: '123' };

      (learnerProgressService.addlessonProgress as jest.Mock).mockImplementation(
        (data: any, callback: CallableFunction) => {
          callback(new Error('Database error'), null);
        }
      );

      await learnerProgressSqlController.addLearnerProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle exceptions', async () => {
      mockRequest.body = {};

      (learnerProgressService.addlessonProgress as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await learnerProgressSqlController.addLearnerProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getLatestLearnerProgressById', () => {
    it('should return latest learner progress by user ID', async () => {
      mockRequest.params = { id: '123' };

      (learnerProgressService.getLatestLearnerProgressByuserId as jest.Mock).mockImplementation(
        (id: string, callback: CallableFunction) => {
          callback(null, { id: 1, userId: id, progress: 75 });
        }
      );

      await learnerProgressSqlController.getLatestLearnerProgressById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 on service error', async () => {
      mockRequest.params = { id: '123' };

      (learnerProgressService.getLatestLearnerProgressByuserId as jest.Mock).mockImplementation(
        (id: string, callback: CallableFunction) => {
          callback(new Error('Not found'), null);
        }
      );

      await learnerProgressSqlController.getLatestLearnerProgressById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getLearnerProgressById', () => {
    it('should return learner progress by ID', async () => {
      mockRequest.params = { id: '1' };

      (learnerProgressService.getLearnerProgressById as jest.Mock).mockImplementation(
        (id: number, callback: CallableFunction) => {
          callback(null, { id, progress: 60 });
        }
      );

      await learnerProgressSqlController.getLearnerProgressById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getLearnerProgressByuserId', () => {
    it('should return learner progress by user ID', async () => {
      mockRequest.params = { id: 'user123' };

      (learnerProgressService.getLearnerProgressByUserId as jest.Mock).mockImplementation(
        (id: string, callback: CallableFunction) => {
          callback(null, [{ id: 1, userId: id }]);
        }
      );

      await learnerProgressSqlController.getLearnerProgressByuserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getLearnerProgressBysessionId', () => {
    it('should return learner progress by session ID', async () => {
      mockRequest.params = { id: 'session123' };

      (learnerProgressService.getLearnerProgressBySessionId as jest.Mock).mockImplementation(
        (id: string, callback: CallableFunction) => {
          callback(null, [{ sessionId: id }]);
        }
      );

      await learnerProgressSqlController.getLearnerProgressBysessionId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getLearnerProgressBysubsessionId', () => {
    it('should return learner progress by sub-session ID', async () => {
      mockRequest.params = { id: 'subsession123' };

      (learnerProgressService.getLearnerProgressBySubSessionId as jest.Mock).mockImplementation(
        (id: string, callback: CallableFunction) => {
          callback(null, [{ subSessionId: id }]);
        }
      );

      await learnerProgressSqlController.getLearnerProgressBysubsessionId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateLearnerProgressById', () => {
    it('should successfully update learner progress by ID', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { progress: 80 };

      (learnerProgressService.updateLearnerProgressById as jest.Mock).mockImplementation(
        (id: number, data: any, callback: CallableFunction) => {
          callback(null, { id, ...data });
        }
      );

      await learnerProgressSqlController.updateLearnerProgressById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateLearnerProgressBysubsessionId', () => {
    it('should successfully update learner progress by sub-session ID', async () => {
      mockRequest.params = { id: 'subsession123' };
      mockRequest.body = { progress: 90 };

      (learnerProgressService.updateLearnerProgressBysubsessionId as jest.Mock).mockImplementation(
        (id: string, data: any, callback: CallableFunction) => {
          callback(null, { subSessionId: id, ...data });
        }
      );

      await learnerProgressSqlController.updateLearnerProgressBysubsessionId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteLearnerProgressById', () => {
    it('should successfully delete learner progress by ID', async () => {
      mockRequest.params = { id: '1' };

      (learnerProgressService.deleteLearnerProgressById as jest.Mock).mockImplementation(
        (id: string, callback: CallableFunction) => {
          callback(null, { deleted: true });
        }
      );

      await learnerProgressSqlController.deleteLearnerProgressById(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteLearnerProgressByuserId', () => {
    it('should successfully delete learner progress by user ID', async () => {
      mockRequest.params = { id: 'user123' };

      (learnerProgressService.deleteLearnerProgressByUserId as jest.Mock).mockImplementation(
        (userId: string, callback: CallableFunction) => {
          callback(null, { deleted: true });
        }
      );

      await learnerProgressSqlController.deleteLearnerProgressByuserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteLearnerProgressBysubsessionId', () => {
    it('should successfully delete learner progress by sub-session ID', async () => {
      mockRequest.params = { id: 'subsession123' };

      (learnerProgressService.deleteLearnerProgressBySubSessionId as jest.Mock).mockImplementation(
        (subSessionId: string, callback: CallableFunction) => {
          callback(null, { deleted: true });
        }
      );

      await learnerProgressSqlController.deleteLearnerProgressBysubsessionId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});


