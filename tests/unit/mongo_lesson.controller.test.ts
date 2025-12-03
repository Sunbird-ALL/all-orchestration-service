import { Request, Response } from 'express';
import lessonController from '../../src/mongo_module/modules/lesson/lesson.controller';
import lessonServices from '../../src/mongo_module/modules/lesson/lesson.services';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';

jest.mock('../../src/mongo_module/modules/lesson/lesson.services');

describe('lessonController (MongoDB)', () => {
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

  describe('addLesson', () => {
    it('should return 400 if validation fails', async () => {
      mockRequest.body = {};

      await lessonController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should successfully add a lesson', async () => {
      mockRequest.body = { 
        sessionId: 'session123',
        language: 'en',
        milestone: 'milestone1',
        milestoneLevel: 'level1',
        lesson: 'lesson1',
        progress: 50
      };

      (lessonServices.addLesson as jest.Mock).mockImplementation(
        (lesson: any, callback: CallableFunction) => {
          callback(null, { id: '123', ...lesson });
        }
      );

      await lessonController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(lessonServices.addLesson).toHaveBeenCalledWith(
        expect.objectContaining({ userId: '123' }),
        expect.any(Function)
      );
    });

    it('should return 400 on service error', async () => {
      mockRequest.body = { title: 'Test Lesson' };

      (lessonServices.addLesson as jest.Mock).mockImplementation(
        (lesson: any, callback: CallableFunction) => {
          callback(new Error('Database error'), null);
        }
      );

      await lessonController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle exceptions', async () => {
      mockRequest.body = {};

      (lessonServices.addLesson as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await lessonController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getLessonProgress', () => {
    it('should return 400 if validation fails', async () => {
      mockRequest.query = {};

      await lessonController.getLessonProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return lesson progress', async () => {
      mockRequest.query = { language: 'en' };

      (lessonServices.getLessonProgress as jest.Mock).mockImplementation(
        (userId: string, language: string, callback: CallableFunction) => {
          callback(null, { totalLessons: 10, completed: 5 });
        }
      );

      await lessonController.getLessonProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(lessonServices.getLessonProgress).toHaveBeenCalledWith(
        '123',
        'en',
        expect.any(Function)
      );
    });

    it('should return 400 on service error', async () => {
      mockRequest.query = { language: 'en' };

      (lessonServices.getLessonProgress as jest.Mock).mockImplementation(
        (userId: string, language: string, callback: CallableFunction) => {
          callback(new Error('Not found'), null);
        }
      );

      await lessonController.getLessonProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle exceptions', async () => {
      mockRequest.query = { language: 'en' };

      (lessonServices.getLessonProgress as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await lessonController.getLessonProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});


