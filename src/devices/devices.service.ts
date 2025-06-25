import { Injectable } from '@nestjs/common';

@Injectable()
export class DevicesService {
  async registerDevice(fcmToken: string, deviceOs: 'ios' | 'android' | 'web') {
    // TODO: Implement device registration logic
    return { id: '018c7e0c-aaaa-bbbb-cccc-6d47afd8c8fc' };
  }

  async deleteDevice(deviceId: string) {
    // TODO: Implement device deletion logic
    return;
  }
}
