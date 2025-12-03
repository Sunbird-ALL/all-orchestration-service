import { Request, Response } from 'express';
import lessonSqlController from '../../src/sql_module/module/lesson_Module/lessonController';
import lessonSqlService from '../../src/sql_module/module/lesson_Module/lessonService';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';

jest.mock('../../src/sql_module/module/lesson_Module/lessonService');

describe('lessonSqlController', () => {
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

  describe('addLesson', () => {
    it('should successfully add a lesson', async () => {
      const mockLesson = { title: 'Test Lesson', content: 'Lesson content' };
      mockRequest.body = mockLesson;

      (lessonSqlService.addLessonSql as jest.Mock).mockImplementation(
        (lesson: any, callback: CallableFunction) => {
          callback(null, { id: 1, ...lesson });
        }
      );

      await lessonSqlController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(expect.any(HttpResponse));
    });

    it('should return 400 when service returns error', async () => {
      mockRequest.body = { title: 'Test' };

      (lessonSqlService.addLessonSql as jest.Mock).mockImplementation(
        (lesson: any, callback: CallableFunction) => {
          callback(new Error('Database error'), null);
        }
      );

      await lessonSqlController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle exceptions', async () => {
      mockRequest.body = {};

      (lessonSqlService.addLessonSql as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await lessonSqlController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getLessonProgress', () => {
    it('should return lesson progress for user', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.query = { language: 'en' };

      (lessonSqlService.getLessonProgress as jest.Mock).mockImplementation(
        (userId: string, language: string, callback: CallableFunction) => {
          callback(null, { totalLessons: 10, completed: 5 });
        }
      );

      await lessonSqlController.getLessonProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(lessonSqlService.getLessonProgress).toHaveBeenCalledWith(
        'user123',
        'en',
        expect.any(Function)
      );
    });

    it('should return 400 on service error', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.query = { language: 'en' };

      (lessonSqlService.getLessonProgress as jest.Mock).mockImplementation(
        (userId: string, language: string, callback: CallableFunction) => {
          callback(new Error('Not found'), null);
        }
      );

      await lessonSqlController.getLessonProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle exceptions', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.query = { language: 'en' };

      (lessonSqlService.getLessonProgress as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await lessonSqlController.getLessonProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });
});


