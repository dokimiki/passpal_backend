import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from './devices.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { User, UserDevice } from '@prisma/client';

describe('DevicesService', () => {
  let service: DevicesService;
  let prisma: PrismaService;

  const mockUser: User = {
    id: '018c7e0c-1234-5678-9abc-def012345678',
    firebaseUid: 'firebase-uid-123',
    banned: false,
    banReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBannedUser: User = {
    ...mockUser,
    banned: true,
    banReason: 'Policy violation',
  };

  const mockDevice: UserDevice = {
    id: '018c7e0c-aaaa-bbbb-cccc-def012345678',
    userId: mockUser.id,
    fcmToken: 'test-fcm-token',
    deviceOs: 'ios' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    userDevice: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DevicesService>(DevicesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerDevice', () => {
    it('should register a device successfully', async () => {
      mockPrismaService.userDevice.upsert.mockResolvedValue(mockDevice);

      const result = await service.registerDevice(
        mockUser,
        'test-fcm-token',
        'ios',
      );

      expect(mockPrismaService.userDevice.upsert).toHaveBeenCalledWith({
        where: {
          userId_fcmToken: {
            userId: mockUser.id,
            fcmToken: 'test-fcm-token',
          },
        },
        update: {
          deviceOs: 'ios',
          updatedAt: expect.any(Date) as Date,
        },
        create: {
          userId: mockUser.id,
          fcmToken: 'test-fcm-token',
          deviceOs: 'ios',
        },
      });
      expect(result).toEqual({ id: mockDevice.id });
    });

    it('should throw ForbiddenException for banned user', async () => {
      await expect(
        service.registerDevice(mockBannedUser, 'test-fcm-token', 'ios'),
      ).rejects.toThrow(
        new ForbiddenException('User is banned due to Policy violation'),
      );
    });
  });

  describe('deleteDevice', () => {
    it('should delete a device successfully', async () => {
      mockPrismaService.userDevice.findFirst.mockResolvedValue(mockDevice);
      mockPrismaService.userDevice.delete.mockResolvedValue(mockDevice);

      await service.deleteDevice(mockUser, mockDevice.id);

      expect(mockPrismaService.userDevice.findFirst).toHaveBeenCalledWith({
        where: {
          id: mockDevice.id,
          userId: mockUser.id,
        },
      });
      expect(mockPrismaService.userDevice.delete).toHaveBeenCalledWith({
        where: {
          id: mockDevice.id,
        },
      });
    });

    it('should throw NotFoundException if device not found', async () => {
      mockPrismaService.userDevice.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteDevice(mockUser, 'non-existent-id'),
      ).rejects.toThrow(
        new NotFoundException(
          'Device not found or does not belong to current user',
        ),
      );
    });

    it('should throw ForbiddenException for banned user', async () => {
      await expect(
        service.deleteDevice(mockBannedUser, mockDevice.id),
      ).rejects.toThrow(
        new ForbiddenException('User is banned due to Policy violation'),
      );
    });
  });
});
