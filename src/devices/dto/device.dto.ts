import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @IsEnum(['ios', 'android', 'web'])
  deviceOs: 'ios' | 'android' | 'web';
}

export class DeviceResponseDto {
  @IsUUID()
  id: string;
}

export class MessageResponseDto {
  @IsString()
  message: string;
}
