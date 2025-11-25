const userController = require('../src/controllers/userController');
const { ApiError } = require('../src/utils/apiResponse');
const { createMockReq, createMockRes, createMockNext } = require('./utils/mockExpress');

jest.mock('../src/models/User', () => ({
  findByPk: jest.fn(),
  findAndCountAll: jest.fn(),
}));

jest.mock('../src/enums/RoleEnum', () => {
  const values = ['admin', 'user'];
  const mock = {
    ADMIN: 'admin',
    USER: 'user',
    values,
    isValid: jest.fn((role) => values.includes(role)),
  };
  return mock;
});

jest.mock('../src/enums/PermissionEnum', () => {
  const values = ['manage_users', 'view_users'];
  const mock = {
    values,
    defaultByRole: {
      admin: ['manage_users', 'view_users'],
      user: ['view_users'],
    },
    isValid: jest.fn((perm) => values.includes(perm)),
  };
  return mock;
});

const User = require('../src/models/User');
const RoleEnum = require('../src/enums/RoleEnum');
const PermissionEnum = require('../src/enums/PermissionEnum');

describe('userController', () => {
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();
    res = createMockRes();
    next = createMockNext();
    RoleEnum.isValid.mockImplementation((role) => RoleEnum.values.includes(role));
    PermissionEnum.isValid.mockImplementation((perm) => PermissionEnum.values.includes(perm));
  });

  describe('getUserProfile', () => {
    it('responds with profile when user exists', async () => {
      const req = createMockReq({ userId: 1 });
      const userRecord = { id: 1, fullName: 'John Doe' };
      User.findByPk.mockResolvedValue(userRecord);

      await userController.getUserProfile(req, res, next);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: userRecord }));
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next with 404 when user not found', async () => {
      const req = createMockReq({ userId: 1 });
      User.findByPk.mockResolvedValue(null);

      await userController.getUserProfile(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(404);
    });
  });

  describe('changePassword', () => {
    const baseBody = {
      currentPassword: 'current123',
      newPassword: 'newPass123',
      confirmPassword: 'newPass123',
    };

    it('rejects when confirm password mismatch', async () => {
      const req = createMockReq({
        userId: 1,
        body: { ...baseBody, confirmPassword: 'nomatch' },
      });

      await userController.changePassword(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
    });

    it('rejects when current password invalid', async () => {
      const req = createMockReq({ userId: 1, body: baseBody });
      const userRecord = {
        id: 1,
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      User.findByPk.mockResolvedValue(userRecord);

      await userController.changePassword(req, res, next);

      expect(userRecord.comparePassword).toHaveBeenCalledWith('current123');
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
    });

    it('updates password when validation succeeds', async () => {
      const req = createMockReq({ userId: 1, body: baseBody });
      const userRecord = {
        id: 1,
        passwordHash: 'old',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(),
      };
      User.findByPk.mockResolvedValue(userRecord);

      await userController.changePassword(req, res, next);

      expect(userRecord.passwordHash).toBe('newPass123');
      expect(userRecord.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('updateUserRole', () => {
    it('returns 404 when user does not exist', async () => {
      const req = createMockReq({ params: { id: '5' }, body: { role: 'admin' } });
      User.findByPk.mockResolvedValue(null);

      await userController.updateUserRole(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(404);
    });

    it('returns 400 for invalid role', async () => {
      const req = createMockReq({ params: { id: '6' }, body: { role: 'invalid' } });
      const userRecord = { id: 6 };
      User.findByPk.mockResolvedValue(userRecord);
      RoleEnum.isValid.mockReturnValue(false);

      await userController.updateUserRole(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toMatch(/Invalid role/);
    });

    it('returns 400 when permissions contain invalid values', async () => {
      const req = createMockReq({
        params: { id: '7' },
        body: { permissions: ['invalid-perm'] },
      });
      const userRecord = { id: 7 };
      User.findByPk.mockResolvedValue(userRecord);
      PermissionEnum.isValid.mockReturnValue(false);

      await userController.updateUserRole(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toMatch(/Invalid permissions/);
    });

    it('applies default permissions when role updated', async () => {
      const req = createMockReq({ params: { id: '8' }, body: { role: 'admin' } });
      const userRecord = { id: 8, save: jest.fn().mockResolvedValue() };
      User.findByPk.mockResolvedValue(userRecord);
      RoleEnum.isValid.mockReturnValue(true);

      await userController.updateUserRole(req, res, next);

      expect(userRecord.role).toBe('admin');
      expect(userRecord.permissions).toEqual(PermissionEnum.defaultByRole.admin);
      expect(userRecord.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
