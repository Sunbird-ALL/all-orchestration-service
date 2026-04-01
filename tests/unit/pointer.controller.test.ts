import { Request, Response } from 'express';
import pointerController from '../../src/sql_module/module/pointer_Module/pointerController';
import pointerSqlService from '../../src/sql_module/module/pointer_Module/pointerScrvice';
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

jest.mock('../../src/sql_module/module/pointer_Module/pointerScrvice');

describe('pointerController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let statusSpy: jest.Mock;
  let sendSpy: jest.Mock;

  beforeEach(() => {
    const mocks = setupControllerTest();
    mockRequest = mocks.mockRequest;
    mockResponse = mocks.mockResponse;
    mockNext = mocks.mockNext;
    statusSpy = mocks.statusSpy;
    sendSpy = mocks.sendSpy;
  });

  describe('addPointer', () => {
    it('should successfully add a pointer', async () => {
      const mockPointer = { userId: '123', points: 100 };
      mockRequest.body = mockPointer;

      (pointerSqlService.addPointer as jest.Mock).mockImplementation(
        createSuccessServiceCallback({ id: 1, ...mockPointer })
      );

      await pointerController.addPointer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerSuccess(statusSpy, sendSpy);
    });

    it('should return 400 when service returns error', async () => {
      mockRequest.body = { userId: '123' };

      (pointerSqlService.addPointer as jest.Mock).mockImplementation(
        createErrorServiceCallback('Database error')
      );

      await pointerController.addPointer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
    });

    it('should handle exceptions', async () => {
      mockRequest.body = {};

      (pointerSqlService.addPointer as jest.Mock).mockImplementation(
        createExceptionServiceCallback('Unexpected error')
      );

      await pointerController.addPointer(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
    });
  });

  describe('getPointersByUserId', () => {
    const testNullParameter = (paramName: string, params: any, query: any) => {
      it(`should return 400 if ${paramName} is null`, async () => {
        mockRequest.params = params;
        mockRequest.query = query;

        await pointerController.getPointersByUserId(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expectControllerError(statusSpy);
        expect(pointerSqlService.getPointersByUserID).not.toHaveBeenCalled();
      });
    };

    testNullParameter('userId', { userId: 'null', sessionId: 'session123' }, { language: 'en' });
    testNullParameter('sessionId', { userId: 'user123', sessionId: 'null' }, { language: 'en' });
    testNullParameter('language', { userId: 'user123', sessionId: 'session123' }, { language: 'null' });

    it('should return pointers when all parameters are valid', async () => {
      mockRequest.params = { userId: 'user123', sessionId: 'session123' };
      mockRequest.query = { language: 'en' };

      (pointerSqlService.getPointersByUserID as jest.Mock).mockImplementation(
        (userId: string, sessionId: string, language: string, callback: CallableFunction) => {
          callback(null, { totalPoints: 500 });
        }
      );

      await pointerController.getPointersByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerSuccess(statusSpy, sendSpy);
      expect(pointerSqlService.getPointersByUserID).toHaveBeenCalledWith(
        'user123',
        'session123',
        'en',
        expect.any(Function)
      );
    });

    it('should return 400 on service error', async () => {
      mockRequest.params = { userId: 'user123', sessionId: 'session123' };
      mockRequest.query = { language: 'en' };

      (pointerSqlService.getPointersByUserID as jest.Mock).mockImplementation(
        (userId: string, sessionId: string, language: string, callback: CallableFunction) => {
          callback(new Error('Not found'), null);
        }
      );

      await pointerController.getPointersByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
    });

    it('should handle exceptions', async () => {
      mockRequest.params = { userId: 'user123', sessionId: 'session123' };
      mockRequest.query = { language: 'en' };

      (pointerSqlService.getPointersByUserID as jest.Mock).mockImplementation(
        createExceptionServiceCallback('Unexpected error')
      );

      await pointerController.getPointersByUserId(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expectControllerError(statusSpy);
    });
  });
});


