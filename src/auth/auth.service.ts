import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async signup(firebaseUid: string) {
    // TODO: Implement user signup logic
    return { message: 'created' };
  }
}
