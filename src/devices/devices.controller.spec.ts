import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/device.dto';
import { User } from '@prisma/client';

describe('DevicesController', () => {
  let controller: DevicesController;
  let service: DevicesService;

  const mockUser: User = {
    id: '018c7e0c-1234-5678-9abc-def012345678',
    firebaseUid: 'firebase-uid-123',
    banned: false,
    banReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDevicesService = {
    registerDevice: jest.fn(),
    deleteDevice: jest.fn(),
  };

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        {
          provide: DevicesService,
          useValue: mockDevicesService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<DevicesController>(DevicesController);
    service = module.get<DevicesService>(DevicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerDevice', () => {
    it('should register a device successfully', async () => {
      const deviceDto: RegisterDeviceDto = {
        fcmToken: 'test-fcm-token',
        deviceOs: 'ios',
      };

      const expectedResult = { id: '018c7e0c-aaaa-bbbb-cccc-def012345678' };
      mockDevicesService.registerDevice.mockResolvedValue(expectedResult);

      const result = await controller.registerDevice(mockUser, deviceDto);

      expect(mockDevicesService.registerDevice).toHaveBeenCalledWith(
        mockUser,
        deviceDto.fcmToken,
        deviceDto.deviceOs,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteDevice', () => {
    it('should delete a device successfully', async () => {
      const deviceId = '018c7e0c-aaaa-bbbb-cccc-def012345678';
      mockDevicesService.deleteDevice.mockResolvedValue(undefined);

      await controller.deleteDevice(mockUser, deviceId);

      expect(mockDevicesService.deleteDevice).toHaveBeenCalledWith(
        mockUser,
        deviceId,
      );
    });
  });
});
