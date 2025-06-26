import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatedIdDto } from './dto/response.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }

  async signup(firebaseUid: string): Promise<CreatedIdDto> {
    // Validate Firebase UID by getting user record from Firebase
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUser(firebaseUid);
    } catch (error) {
      throw new BadRequestException('Invalid Firebase UID');
    }

    // Validate email domain (must be @m.chukyo-u.ac.jp)
    if (!firebaseUser.email) {
      throw new BadRequestException('Firebase user must have an email address');
    }

    if (!firebaseUser.email.endsWith('@m.chukyo-u.ac.jp')) {
      throw new ForbiddenException('Email must be from @m.chukyo-u.ac.jp domain');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (existingUser) {
      // Return existing user's ID instead of throwing error
      return { id: existingUser.id };
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
