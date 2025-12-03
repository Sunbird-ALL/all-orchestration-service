import request from 'supertest';
import express from 'express';
import { createTestApp } from './app.setup';
import lessonSqlService from '../../src/sql_module/module/lesson_Module/lessonService';

// Mock lesson service
jest.mock('../../src/sql_module/module/lesson_Module/lessonService', () => ({
  __esModule: true,
  default: {
    addLessonSql: jest.fn(),
    getLessonProgress: jest.fn(),
  },
}));

describe('Lesson API Tests (SQL)', () => {
  let app: express.Application;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Set up default mock implementations
    (lessonSqlService.addLessonSql as jest.Mock).mockImplementation(
      (lesson: any, callback: CallableFunction) => {
        callback(null, { id: 1, ...lesson });
      }
    );
    
    (lessonSqlService.getLessonProgress as jest.Mock).mockImplementation(
      (userId: string, language: string, callback: CallableFunction) => {
        callback(null, { totalLessons: 10, completed: 5 });
      }
    );
  });

  beforeAll(() => {
    app = createTestApp('mysql');
  });

  describe('POST /api/lesson/addLesson', () => {
    it('should successfully add a lesson', async () => {
      const lessonData = {
        title: 'Test Lesson',
        content: 'Lesson content',
        language: 'en',
      };

      const response = await request(app)
        .post('/api/lesson/addLesson')
        .send(lessonData)
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('message', 'Lesson added');
    });

    it('should return 400 on service error', async () => {
      // Mock service to return error for this test
      (lessonSqlService.addLessonSql as jest.Mock).mockImplementationOnce(
        (lesson: any, callback: CallableFunction) => {
          callback(new Error('Database error'), null);
        }
      );

      const response = await request(app)
        .post('/api/lesson/addLesson')
        .send({ title: 'Test' })
        .expect(400);

      expect(response.body).toHaveProperty('status', 400);
    });
  });

  describe('GET /api/lesson/getLessonProgressByUserId/:userId', () => {
    it('should return lesson progress', async () => {
      const response = await request(app)
        .get('/api/lesson/getLessonProgressByUserId/user123')
        .query({ language: 'en' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('message', 'Total Lesson Progress Returned');
    });
  });
});

