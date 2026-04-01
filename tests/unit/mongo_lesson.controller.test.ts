import { Request, Response } from 'express';
import lessonController from '../../src/mongo_module/modules/lesson/lesson.controller';
import lessonServices from '../../src/mongo_module/modules/lesson/lesson.services';
import HttpException from '../../src/common/http.Exception/http.Exception';
import HttpResponse from '../../src/common/http.Response/http.Response';
import {
  setupControllerTest,
  createSuccessServiceCallback,
  createErrorServiceCallback,
  createExceptionServiceCallback,
  expectControllerSuccess,
  expectControllerError,
} from '../helpers/test-utils';

jest.mock('../../src/mongo_module/modules/lesson/lesson.services');

describe('lessonController (MongoDB)', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let statusSpy: jest.Mock;
  let sendSpy: jest.Mock;

  beforeEach(() => {
    const mocks = setupControllerTest({ withVirtualId: true });
    mockRequest = mocks.mockRequest;
    mockResponse = mocks.mockResponse;
    mockNext = mocks.mockNext;
    statusSpy = mocks.statusSpy;
    sendSpy = mocks.sendSpy;
  });

  describe('addLesson', () => {
    it('should return 400 if validation fails', async () => {
      mockRequest.body = {};

      await lessonController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
    });

    it('should successfully add a lesson', async () => {
      const lessonData = { 
        sessionId: 'session123',
        language: 'en',
        milestone: 'milestone1',
        milestoneLevel: 'level1',
        lesson: 'lesson1',
        progress: 50
      };
      mockRequest.body = lessonData;

      (lessonServices.addLesson as jest.Mock).mockImplementation(
        createSuccessServiceCallback({ id: '123', ...lessonData })
      );

      await lessonController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerSuccess(statusSpy, sendSpy);
      expect(lessonServices.addLesson).toHaveBeenCalledWith(
        expect.objectContaining({ userId: '123' }),
        expect.any(Function)
      );
    });

    it('should return 400 on service error', async () => {
      mockRequest.body = { title: 'Test Lesson' };

      (lessonServices.addLesson as jest.Mock).mockImplementation(
        createErrorServiceCallback('Database error')
      );

      await lessonController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
    });

    it('should handle exceptions', async () => {
      mockRequest.body = {};

      (lessonServices.addLesson as jest.Mock).mockImplementation(
        createExceptionServiceCallback('Unexpected error')
      );

      await lessonController.addLesson(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
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

      expectControllerError(statusSpy);
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

      expectControllerSuccess(statusSpy, sendSpy);
      expect(lessonServices.getLessonProgress).toHaveBeenCalledWith(
        '123',
        'en',
        expect.any(Function)
      );
    });

    it('should return 400 on service error', async () => {
      mockRequest.query = { language: 'en' };

      (lessonServices.getLessonProgress as jest.Mock).mockImplementation(
        createErrorServiceCallback('Not found')
      );

      await lessonController.getLessonProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
    });

    it('should handle exceptions', async () => {
      mockRequest.query = { language: 'en' };

      (lessonServices.getLessonProgress as jest.Mock).mockImplementation(
        createExceptionServiceCallback('Unexpected error')
      );

      await lessonController.getLessonProgress(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
    });
  });
});


