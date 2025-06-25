import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async registerDevice(
    user: User,
    fcmToken: string,
    deviceOs: 'ios' | 'android' | 'web',
  ) {
    // Check if user is banned
    if (user.banned) {
      throw new ForbiddenException(
        `User is banned${user.banReason ? ` due to ${user.banReason}` : ''}`,
      );
    }

    // Use upsert to handle duplicate tokens - update if exists, create if not
    const device = await this.prisma.userDevice.upsert({
      where: {
        userId_fcmToken: {
          userId: user.id,
          fcmToken: fcmToken,
        },
      },
      update: {
        deviceOs: deviceOs,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        fcmToken: fcmToken,
        deviceOs: deviceOs,
      },
    });

    return { id: device.id };
  }

  async deleteDevice(user: User, deviceId: string) {
    // Check if user is banned
    if (user.banned) {
      throw new ForbiddenException(
        `User is banned${user.banReason ? ` due to ${user.banReason}` : ''}`,
      );
    }

    // Find the device and verify it belongs to the user
    const device = await this.prisma.userDevice.findFirst({
      where: {
        id: deviceId,
        userId: user.id,
      },
    });

    if (!device) {
      throw new NotFoundException(
        'Device not found or does not belong to current user',
      );
    }

    // Delete the device
    await this.prisma.userDevice.delete({
      where: {
        id: deviceId,
      },
    });
  }
}
