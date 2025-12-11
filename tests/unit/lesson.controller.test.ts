import { Request, Response } from 'express';
import lessonSqlController from '../../src/sql_module/module/lesson_Module/lessonController';
import lessonSqlService from '../../src/sql_module/module/lesson_Module/lessonService';
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

jest.mock('../../src/sql_module/module/lesson_Module/lessonService');

describe('lessonSqlController', () => {
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

  describe('addLesson', () => {
    it('should successfully add a lesson', async () => {
      const mockLesson = { title: 'Test Lesson', content: 'Lesson content' };
      mockRequest.body = mockLesson;

      (lessonSqlService.addLessonSql as jest.Mock).mockImplementation(
        createSuccessServiceCallback({ id: 1, ...mockLesson })
      );

      await lessonSqlController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerSuccess(statusSpy, sendSpy);
    });

    it('should return 400 when service returns error', async () => {
      mockRequest.body = { title: 'Test' };

      (lessonSqlService.addLessonSql as jest.Mock).mockImplementation(
        createErrorServiceCallback('Database error')
      );

      await lessonSqlController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
    });

    it('should handle exceptions', async () => {
      mockRequest.body = {};

      (lessonSqlService.addLessonSql as jest.Mock).mockImplementation(
        createExceptionServiceCallback('Unexpected error')
      );

      await lessonSqlController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
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

      expectControllerSuccess(statusSpy, sendSpy);
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

      expectControllerError(statusSpy);
    });

    it('should handle exceptions', async () => {
      mockRequest.params = { userId: 'user123' };
      mockRequest.query = { language: 'en' };

      (lessonSqlService.getLessonProgress as jest.Mock).mockImplementation(
        createExceptionServiceCallback('Unexpected error')
      );

      await lessonSqlController.getLessonProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
    });
  });
});


