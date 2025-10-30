const User = require('../models/userModel');
const userService = require('../services/userService');

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await userService.createUser(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await userService.createUser(userData);

      await expect(userService.createUser(userData)).rejects.toThrow();
    });
  });

  describe('loginUser', () => {
    it('should login user with correct credentials', async () => {
      const userData = {
        email: 'login@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await userService.createUser(userData);

      const result = await userService.loginUser(userData.email, userData.password);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw error with incorrect password', async () => {
      const userData = {
        email: 'login2@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      await userService.createUser(userData);

      await expect(
        userService.loginUser(userData.email, 'wrongpassword')
      ).rejects.toThrow();
    });
  });
});

