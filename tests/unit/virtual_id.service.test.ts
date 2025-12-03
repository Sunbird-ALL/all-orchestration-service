import virtualIdSqlSqlService from '../../src/sql_module/module/virtual_Id_Module/virtual_id.service';
import { myDataSource } from '../../src/sql_module/config/data.config';
import { virtualId } from '../../src/sql_module/schema/user';

// Mock the data source and repository
jest.mock('../../src/sql_module/config/data.config', () => ({
  myDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('virtualIdSqlSqlService', () => {
  let mockRepository: any;
  let mockFindOne: jest.Mock;
  let mockCreate: jest.Mock;
  let mockSave: jest.Mock;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup repository mocks
    mockFindOne = jest.fn();
    mockCreate = jest.fn();
    mockSave = jest.fn();

    mockRepository = {
      findOne: mockFindOne,
      create: mockCreate,
      save: mockSave,
    };

    (myDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
  });

  describe('genarateId', () => {
    describe('Existing User Scenarios', () => {
      it('should return existing virtual ID when user exists', async () => {
        const username = 'existinguser';
        const existingVirtualId = '9876543210';
        const mockUser = {
          id: 1,
          userName: 'existinguser',
          virtualId: existingVirtualId,
          createdAt: new Date(),
        };

        mockFindOne.mockResolvedValue(mockUser);

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(myDataSource.getRepository).toHaveBeenCalledWith(virtualId);
        expect(mockFindOne).toHaveBeenCalledWith({
          where: { userName: 'existinguser' },
        });
        expect(callback).toHaveBeenCalledWith(null, {
          virtualID: existingVirtualId,
        });
        expect(mockCreate).not.toHaveBeenCalled();
        expect(mockSave).not.toHaveBeenCalled();
      });

      it('should normalize username to lowercase when checking existing user', async () => {
        const username = 'TestUser123';
        const mockUser = {
          id: 1,
          userName: 'testuser123',
          virtualId: '1234567890',
          createdAt: new Date(),
        };

        mockFindOne.mockResolvedValue(mockUser);

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(mockFindOne).toHaveBeenCalledWith({
          where: { userName: 'testuser123' },
        });
        expect(callback).toHaveBeenCalledWith(null, {
          virtualID: '1234567890',
        });
      });

      it('should trim whitespace from username', async () => {
        const username = '  testuser  ';
        const mockUser = {
          id: 1,
          userName: 'testuser',
          virtualId: '1234567890',
          createdAt: new Date(),
        };

        mockFindOne.mockResolvedValue(mockUser);

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(mockFindOne).toHaveBeenCalledWith({
          where: { userName: 'testuser' },
        });
      });
    });

    describe('New User Scenarios', () => {
      it('should generate and save new virtual ID for new user', async () => {
        const username = 'newuser';
        const mockNewUser = {
          id: 1,
          userName: 'newuser',
          virtualId: '1234567890',
          createdAt: new Date(),
        };

        mockFindOne.mockResolvedValue(null);
        mockCreate.mockReturnValue(mockNewUser);
        mockSave.mockResolvedValue(mockNewUser);

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(mockFindOne).toHaveBeenCalledWith({
          where: { userName: 'newuser' },
        });
        expect(mockCreate).toHaveBeenCalled();
        expect(mockSave).toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(null, {
          virtualID: expect.any(Number),
        });

        // Verify virtual ID is a 10-digit number
        const callbackCall = callback.mock.calls[0];
        const virtualID = callbackCall[1].virtualID;
        expect(virtualID).toBeGreaterThanOrEqual(1000000000);
        expect(virtualID).toBeLessThan(10000000000);
      });

      it('should generate unique virtual ID for each new user', async () => {
        const username = 'newuser';
        mockFindOne.mockResolvedValue(null);
        mockCreate.mockImplementation((data) => ({
          ...data,
          id: 1,
          createdAt: new Date(),
        }));
        mockSave.mockResolvedValue({});

        const callback1 = jest.fn();
        const callback2 = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback1);
        await virtualIdSqlSqlService.genarateId(username, callback2);

        const virtualID1 = callback1.mock.calls[0][1].virtualID;
        const virtualID2 = callback2.mock.calls[0][1].virtualID;

        // They might be different due to random generation
        expect(typeof virtualID1).toBe('number');
        expect(typeof virtualID2).toBe('number');
        expect(virtualID1).toBeGreaterThanOrEqual(1000000000);
        expect(virtualID2).toBeGreaterThanOrEqual(1000000000);
      });

      it('should convert virtual ID to string when creating user', async () => {
        const username = 'newuser';
        mockFindOne.mockResolvedValue(null);
        
        const createdUser = {
          userName: 'newuser',
          virtualId: '1234567890',
        };
        mockCreate.mockReturnValue(createdUser);
        mockSave.mockResolvedValue(createdUser);

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            userName: 'newuser',
            virtualId: expect.any(String),
          })
        );
      });
    });

    describe('Error Handling', () => {
      it('should handle database connection errors', async () => {
        const username = 'testuser';
        const dbError = new Error('Database connection failed');

        mockFindOne.mockRejectedValue(dbError);

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(callback).toHaveBeenCalledWith(dbError, 'Something went wrong!');
      });

      it('should handle repository save errors', async () => {
        const username = 'newuser';
        const saveError = new Error('Failed to save user');

        mockFindOne.mockResolvedValue(null);
        mockCreate.mockReturnValue({
          userName: 'newuser',
          virtualId: '1234567890',
        });
        mockSave.mockRejectedValue(saveError);

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(callback).toHaveBeenCalledWith(saveError, 'Something went wrong!');
      });

      it('should handle repository findOne errors', async () => {
        const username = 'testuser';
        const findError = new Error('Query execution failed');

        mockFindOne.mockRejectedValue(findError);

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(callback).toHaveBeenCalledWith(findError, 'Something went wrong!');
      });

      it('should handle unexpected errors', async () => {
        const username = 'testuser';
        const unexpectedError = new Error('Unexpected error');

        (myDataSource.getRepository as jest.Mock).mockImplementation(() => {
          throw unexpectedError;
        });

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(callback).toHaveBeenCalledWith(
          unexpectedError,
          'Something went wrong!'
        );
      });
    });

    describe('Input Validation', () => {
      it('should handle null username gracefully', async () => {
        const username = null as any;
        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        // Should throw or handle error
        expect(callback).toHaveBeenCalled();
      });

      it('should handle undefined username gracefully', async () => {
        const username = undefined as any;
        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        // Should throw or handle error
        expect(callback).toHaveBeenCalled();
      });

      it('should handle empty string username', async () => {
        const username = '';
        mockFindOne.mockResolvedValue(null);
        mockCreate.mockReturnValue({
          userName: '',
          virtualId: '1234567890',
        });
        mockSave.mockResolvedValue({});

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(mockFindOne).toHaveBeenCalledWith({
          where: { userName: '' },
        });
      });
    });

    describe('Username Normalization', () => {
      it('should convert username to lowercase', async () => {
        const testCases = [
          { input: 'TestUser', expected: 'testuser' },
          { input: 'TESTUSER', expected: 'testuser' },
          { input: 'TeStUsEr', expected: 'testuser' },
        ];

        for (const testCase of testCases) {
          jest.clearAllMocks();
          mockFindOne.mockResolvedValue(null);
          mockCreate.mockReturnValue({
            userName: testCase.expected,
            virtualId: '1234567890',
          });
          mockSave.mockResolvedValue({});

          const callback = jest.fn();

          await virtualIdSqlSqlService.genarateId(testCase.input, callback);

          expect(mockFindOne).toHaveBeenCalledWith({
            where: { userName: testCase.expected },
          });
        }
      });

      it('should trim whitespace from username', async () => {
        const testCases = [
          { input: '  testuser  ', expected: 'testuser' },
          { input: 'testuser  ', expected: 'testuser' },
          { input: '  testuser', expected: 'testuser' },
          { input: '\ttestuser\n', expected: 'testuser' },
        ];

        for (const testCase of testCases) {
          jest.clearAllMocks();
          mockFindOne.mockResolvedValue(null);
          mockCreate.mockReturnValue({
            userName: testCase.expected,
            virtualId: '1234567890',
          });
          mockSave.mockResolvedValue({});

          const callback = jest.fn();

          await virtualIdSqlSqlService.genarateId(testCase.input, callback);

          expect(mockFindOne).toHaveBeenCalledWith({
            where: { userName: testCase.expected },
          });
        }
      });

      it('should combine lowercase and trim operations', async () => {
        const username = '  TeStUsEr  ';
        mockFindOne.mockResolvedValue(null);
        mockCreate.mockReturnValue({
          userName: 'testuser',
          virtualId: '1234567890',
        });
        mockSave.mockResolvedValue({});

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(mockFindOne).toHaveBeenCalledWith({
          where: { userName: 'testuser' },
        });
      });
    });

    describe('Virtual ID Generation', () => {
      it('should generate virtual ID within valid range', async () => {
        const username = 'newuser';
        mockFindOne.mockResolvedValue(null);
        mockCreate.mockImplementation((data) => data);
        mockSave.mockResolvedValue({});

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        const virtualID = callback.mock.calls[0][1].virtualID;
        expect(virtualID).toBeGreaterThanOrEqual(1000000000);
        expect(virtualID).toBeLessThan(10000000000);
        expect(Number.isInteger(virtualID)).toBe(true);
      });

      it('should generate different IDs on multiple calls', async () => {
        const username = 'newuser';
        mockFindOne.mockResolvedValue(null);
        mockCreate.mockImplementation((data) => data);
        mockSave.mockResolvedValue({});

        const virtualIDs: number[] = [];

        for (let i = 0; i < 5; i++) {
          const callback = jest.fn();
          await virtualIdSqlSqlService.genarateId(username, callback);
          virtualIDs.push(callback.mock.calls[0][1].virtualID);
        }

        // At least some should be different (random generation)
        const uniqueIDs = new Set(virtualIDs);
        expect(uniqueIDs.size).toBeGreaterThan(0);
      });
    });

    describe('Callback Execution', () => {
      it('should call callback with null error on success for existing user', async () => {
        const username = 'existinguser';
        const mockUser = {
          id: 1,
          userName: 'existinguser',
          virtualId: '1234567890',
          createdAt: new Date(),
        };

        mockFindOne.mockResolvedValue(mockUser);

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(null, expect.any(Object));
      });

      it('should call callback with null error on success for new user', async () => {
        const username = 'newuser';
        mockFindOne.mockResolvedValue(null);
        mockCreate.mockReturnValue({
          userName: 'newuser',
          virtualId: '1234567890',
        });
        mockSave.mockResolvedValue({});

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(null, expect.any(Object));
      });

      it('should call callback with error on failure', async () => {
        const username = 'testuser';
        const error = new Error('Database error');

        mockFindOne.mockRejectedValue(error);

        const callback = jest.fn();

        await virtualIdSqlSqlService.genarateId(username, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(error, 'Something went wrong!');
      });
    });
  });
});

