import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import {
  RegisterDeviceDto,
  DeviceResponseDto,
  MessageResponseDto,
} from './dto/device.dto';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async registerDevice(
    @CurrentUser() user: User,
    @Body(ValidationPipe) deviceDto: RegisterDeviceDto,
  ): Promise<DeviceResponseDto> {
    return this.devicesService.registerDevice(
      user,
      deviceDto.fcmToken,
      deviceDto.deviceOs,
    );
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDevice(
    @CurrentUser() user: User,
    @Param('deviceId') deviceId: string,
  ): Promise<void> {
    return this.devicesService.deleteDevice(user, deviceId);
  }
}
