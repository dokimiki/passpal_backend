import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { CreatedIdDto } from './dto/response.dto';
import { Public } from './decorators/public.decorator';

@Controller('signup')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto): Promise<CreatedIdDto> {
    try {
      return await this.authService.signup(signupDto.firebaseUid);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Invalid signup data');
    }
  }
}
