import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const signupDto: SignupDto = {
        firebaseUid: 'test-firebase-uid',
      };
      const expectedResult = {
        id: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
      };

      mockAuthService.signup.mockResolvedValue(expectedResult);

      const result = await controller.signup(signupDto);

      expect(mockAuthService.signup).toHaveBeenCalledWith(
        signupDto.firebaseUid,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw ConflictException when user already exists', async () => {
      const signupDto: SignupDto = {
        firebaseUid: 'existing-firebase-uid',
      };

      mockAuthService.signup.mockRejectedValue(
        new ConflictException('User already exists'),
      );

      await expect(controller.signup(signupDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
