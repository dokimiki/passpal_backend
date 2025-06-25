import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('signup')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async signup(@Body() signupDto: { firebaseUid: string }) {
    return this.authService.signup(signupDto.firebaseUid);
  }
}
