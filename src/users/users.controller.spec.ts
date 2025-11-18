import { Test, TestingModule } from '@nestjs/testing';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { AdminResetPasswordDto } from './dto/admin-reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    forgotPassword: jest.fn(),
    refreshToken: jest.fn(),
    adminRegister: jest.fn(),
    adminLogin: jest.fn(),
    adminResetPassword: jest.fn(),
    listUsers: jest.fn(),
    blockUser: jest.fn(),
    unblockUser: jest.fn(),
    deleteUser: jest.fn(),
    followUser: jest.fn(),
    unfollowUser: jest.fn(),
    isFollowing: jest.fn(),
    getFollowersCount: jest.fn(),
    getFollowingCount: jest.fn(),
    getFollowers: jest.fn(),
    getFollowing: jest.fn(),
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a user successfully', async () => {
      const registerDto: RegisterUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        isArtist: false,
      };

      const mockResult = {
        message: 'User registered successfully',
        user: { uid: 'user123', email: 'test@example.com' },
      };

      mockUsersService.registerUser.mockResolvedValue(mockResult);

      const result = await controller.registerUser(registerDto);

      expect(mockUsersService.registerUser).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('loginUser', () => {
    it('should login a user successfully', async () => {
      const loginDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResult = {
        message: 'Succesful Login',
        token: 'jwt-token',
        refresh_token: 'refresh-token',
        user: { uid: 'user123', email: 'test@example.com' },
      };

      mockUsersService.loginUser.mockResolvedValue(mockResult);

      const result = await controller.loginUser(loginDto);

      expect(mockUsersService.loginUser).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('forgotPassword', () => {
    it('should request password reset successfully', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      const mockResult = {
        message: 'Password reset email sent',
      };

      mockUsersService.forgotPassword.mockResolvedValue(mockResult);

      const result = await controller.forgotPassword(forgotPasswordDto);

      expect(mockUsersService.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refresh_token: 'old-refresh-token',
      };

      const mockResult = {
        message: 'Token refreshed successfully',
        id_token: 'new-jwt-token',
        refresh_token: 'new-refresh-token',
        user: { uid: 'user123', email: 'test@example.com' },
      };

      mockUsersService.refreshToken.mockResolvedValue(mockResult);

      const result = await controller.refreshToken(refreshTokenDto);

      expect(mockUsersService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('adminRegister', () => {
    it('should register admin successfully', async () => {
      const adminRegisterDto: AdminRegisterDto = {
        email: 'admin@melodia.com',
        password: 'adminpassword123',
        nombre: 'Admin User',
      };

      const mockResult = {
        admin: { id: 'admin-id', email: 'admin@melodia.com' },
      };

      mockUsersService.adminRegister.mockResolvedValue(mockResult);

      const result = await controller.adminRegister(adminRegisterDto);

      expect(mockUsersService.adminRegister).toHaveBeenCalledWith(
        adminRegisterDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('adminLogin', () => {
    it('should login admin successfully', async () => {
      const adminLoginDto: AdminLoginDto = {
        email: 'admin@melodia.com',
        password: 'adminpassword123',
      };

      const mockResult = {
        token: 'admin-jwt-token',
        admin: { id: 'admin-id', email: 'admin@melodia.com' },
      };

      mockUsersService.adminLogin.mockResolvedValue(mockResult);

      const result = await controller.adminLogin(adminLoginDto);

      expect(mockUsersService.adminLogin).toHaveBeenCalledWith(adminLoginDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('adminResetPassword', () => {
    it('should reset admin password successfully', async () => {
      const adminResetPasswordDto: AdminResetPasswordDto = {
        email: 'admin@melodia.com',
      };

      const mockResult = {
        message: 'Password reset email sent',
      };

      mockUsersService.adminResetPassword.mockResolvedValue(mockResult);

      const result = await controller.adminResetPassword(adminResetPasswordDto);

      expect(mockUsersService.adminResetPassword).toHaveBeenCalledWith(
        adminResetPasswordDto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('listUsers', () => {
    it('should list users with pagination successfully', async () => {
      const listUsersDto: ListUsersDto = {
        page: 1,
        limit: 10,
      };

      const mockResult = {
        users: [
          { id: 'user1', email: 'user1@example.com' },
          { id: 'user2', email: 'user2@example.com' },
        ],
        total: 2,
        page: 1,
        limit: 10,
      };

      mockUsersService.listUsers.mockResolvedValue(mockResult);

      const result = await controller.listUsers(listUsersDto);

      expect(mockUsersService.listUsers).toHaveBeenCalledWith(listUsersDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('blockUser', () => {
    it('should block user successfully', async () => {
      const userId = 'user123';
      const mockResult = {
        message: 'User blocked successfully',
      };

      mockUsersService.blockUser.mockResolvedValue(mockResult);

      const result = await controller.blockUser(userId);

      expect(mockUsersService.blockUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('unblockUser', () => {
    it('should unblock user successfully', async () => {
      const userId = 'user123';
      const mockResult = {
        message: 'User unblocked successfully',
      };

      mockUsersService.unblockUser.mockResolvedValue(mockResult);

      const result = await controller.unblockUser(userId);

      expect(mockUsersService.unblockUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user123';
      const mockResult = {
        message: 'User deleted successfully',
      };

      mockUsersService.deleteUser.mockResolvedValue(mockResult);

      const result = await controller.deleteUser(userId);

      expect(mockUsersService.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('followUser', () => {
    it('should follow user successfully using current user from decorator', async () => {
      const userId = 'user-to-follow';
      const currentUser = { uid: 'current-user-id' };
      const mockResult = {
        status: 'success',
        message: 'User followed successfully',
      };

      mockUsersService.followUser.mockResolvedValue(mockResult);

      const result = await controller.followUser(userId, currentUser);

      expect(mockUsersService.followUser).toHaveBeenCalledWith(
        userId,
        currentUser.uid,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('unfollowUser', () => {
    it('should unfollow user successfully using current user from decorator', async () => {
      const userId = 'user-to-unfollow';
      const currentUser = { uid: 'current-user-id' };
      const mockResult = {
        status: 'success',
        message: 'User unfollowed successfully',
      };

      mockUsersService.unfollowUser.mockResolvedValue(mockResult);

      const result = await controller.unfollowUser(userId, currentUser);

      expect(mockUsersService.unfollowUser).toHaveBeenCalledWith(
        userId,
        currentUser.uid,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getFollowers', () => {
    it('should get user followers successfully', async () => {
      const userId = 'test-user-id';
      const page = 1;
      const limit = 10;
      const mockResult = {
        status: 'success',
        data: {
          followers: [
            { id: 'follower1', username: 'follower1' },
            { id: 'follower2', username: 'follower2' },
          ],
          pagination: { page: 1, limit: 10, total: 2 },
        },
      };

      mockUsersService.getFollowers.mockResolvedValue(mockResult);

      const result = await controller.getFollowers(userId, page, limit);

      expect(mockUsersService.getFollowers).toHaveBeenCalledWith(
        userId,
        page,
        limit,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getFollowing', () => {
    it('should get user following list successfully', async () => {
      const userId = 'test-user-id';
      const page = 1;
      const limit = 10;
      const mockResult = {
        status: 'success',
        data: {
          following: [
            { id: 'following1', username: 'following1' },
            { id: 'following2', username: 'following2' },
          ],
          pagination: { page: 1, limit: 10, total: 2 },
        },
      };

      mockUsersService.getFollowing.mockResolvedValue(mockResult);

      const result = await controller.getFollowing(userId, page, limit);

      expect(mockUsersService.getFollowing).toHaveBeenCalledWith(
        userId,
        page,
        limit,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
