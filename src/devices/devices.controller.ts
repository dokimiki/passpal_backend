import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  async registerDevice(
    @Body()
    deviceDto: {
      fcmToken: string;
      deviceOs: 'ios' | 'android' | 'web';
    },
  ) {
    return this.devicesService.registerDevice(
      deviceDto.fcmToken,
      deviceDto.deviceOs,
    );
  }

  @Delete(':deviceId')
  async deleteDevice(@Param('deviceId') deviceId: string) {
    return this.devicesService.deleteDevice(deviceId);
  }
}
