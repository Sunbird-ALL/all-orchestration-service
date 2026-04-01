import request from 'supertest';
import express from 'express';
import { createTestApp } from './app.setup';
import studentService from '../../src/mongo_module/modules/student/student.service';

// Mock student service
jest.mock('../../src/mongo_module/modules/student/student.service', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findUser: jest.fn(),
  },
}));

describe('Student API Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Set up default mock implementations
    (studentService.create as jest.Mock).mockImplementation(
      (username: string, callback: CallableFunction) => {
        if (username === 'erroruser') {
          callback(new Error('Database error'), null);
        } else {
          callback(null, { username, id: '123', virtualId: '9876543210' });
        }
      }
    );
    
    (studentService.findUser as jest.Mock).mockImplementation(
      (username: string, callback: CallableFunction) => {
        if (username === 'GT123') {
          callback(null, { username, id: '123', virtualId: '9876543210' });
        } else if (username === '12345678901') {
          // Non-teacher user not found by default
          callback(null, null);
        } else {
          callback(null, null);
        }
      }
    );
  });

  beforeAll(() => {
    app = createTestApp('mongodb');
  });

  describe('POST /api/student/register', () => {
    it('should return 400 if type is missing', async () => {
      const response = await request(app)
        .post('/api/student/register')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should register single student successfully', async () => {
      const response = await request(app)
        .post('/api/student/register')
        .query({ type: 'single' })
        .send({ username: '12345678901' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('message', 'Registered successfully');
    });

    it('should return 400 for invalid username format', async () => {
      const response = await request(app)
        .post('/api/student/register')
        .query({ type: 'single' })
        .send({ username: 'invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/student/login', () => {
    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/student/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should login existing teacher user', async () => {
      // Mock findUser to return existing user
      (studentService.findUser as jest.Mock).mockImplementationOnce(
        (username: string, callback: CallableFunction) => {
          callback(null, { username, id: '123', virtualId: '9876543210' });
        }
      );

      const response = await request(app)
        .post('/api/student/login')
        .send({ username: 'GT123' })
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 for non-existing non-teacher user', async () => {
      const response = await request(app)
        .post('/api/student/login')
        .send({ username: '12345678901' })
        .expect(401);

      expect(response.body).toHaveProperty('status', 401);
    });

    it('should login existing non-teacher user', async () => {
      const validUsername = '12345678901'; // Valid 11-digit username
      
      // Mock findUser to return existing user
      (studentService.findUser as jest.Mock).mockImplementationOnce(
        (username: string, callback: CallableFunction) => {
          callback(null, { username, id: '123', virtualId: '9876543210' });
        }
      );

      const response = await request(app)
        .post('/api/student/login')
        .send({ username: validUsername })
        .expect(200);

      expect(response.body).toHaveProperty('result');
      expect(response.body).toHaveProperty('message', 'Login successful');
    });
  });
});

