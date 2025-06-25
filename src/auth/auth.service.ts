import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatedIdDto } from './dto/response.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signup(firebaseUid: string): Promise<CreatedIdDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        firebaseUid,
        banned: false,
      },
      select: {
        id: true,
      },
    });

    return { id: user.id };
  }
}
