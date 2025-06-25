import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto, ClassDto, ClassListDto } from './dto/class.dto';
import { User } from '@prisma/client';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async getClass(manaboClassId: string, term: string): Promise<ClassDto> {
    const classRecord = await this.prisma.class.findUnique({
      where: {
        term_manaboClassId: {
          term,
          manaboClassId,
        },
      },
    });

    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    return {
      id: classRecord.id,
      term: classRecord.term,
      manaboClassId: classRecord.manaboClassId,
      courseId: classRecord.courseId ?? undefined,
    };
  }

  async createClass(classDto: CreateClassDto): Promise<ClassDto> {
    // First, find or create the course
    let course = await this.prisma.course.findUnique({
      where: {
        title_leadInstructor: {
          title: classDto.title,
          leadInstructor: classDto.leadInstructor,
        },
      },
    });

    if (!course) {
      course = await this.prisma.course.create({
        data: {
          title: classDto.title,
          leadInstructor: classDto.leadInstructor,
        },
      });
    }

    // Check if class already exists
    const existingClass = await this.prisma.class.findUnique({
      where: {
        term_manaboClassId: {
          term: classDto.term,
          manaboClassId: classDto.manaboClassId,
        },
      },
    });

    if (existingClass) {
      throw new ConflictException('Class already exists');
    }

    // Create the class
    const classRecord = await this.prisma.class.create({
      data: {
        term: classDto.term,
        manaboClassId: classDto.manaboClassId,
        courseId: course.id,
      },
    });

    return {
      id: classRecord.id,
      term: classRecord.term,
      manaboClassId: classRecord.manaboClassId,
      courseId: classRecord.courseId ?? undefined,
    };
  }

  async subscribeToClassNotifications(
    classId: string,
    user: User,
  ): Promise<{ message: string }> {
    // Check if class exists
    const classRecord = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    // Check if already subscribed
    const existingSubscription = await this.prisma.classNotifier.findUnique({
      where: {
        classId_userId: {
          classId: classId,
          userId: user.id,
        },
      },
    });

    if (existingSubscription) {
      throw new ConflictException('Already subscribed to this class');
    }

    // Create subscription
    await this.prisma.classNotifier.create({
      data: {
        classId: classId,
        userId: user.id,
      },
    });

    return { message: 'Successfully subscribed to class notifications' };
  }

  async unsubscribeFromClassNotifications(
    classId: string,
    user: User,
  ): Promise<void> {
    // Check if subscription exists
    const subscription = await this.prisma.classNotifier.findUnique({
      where: {
        classId_userId: {
          classId: classId,
          userId: user.id,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Delete subscription
    await this.prisma.classNotifier.delete({
      where: {
        classId_userId: {
          classId: classId,
          userId: user.id,
        },
      },
    });
  }

  async getNotifiedClasses(user: User): Promise<ClassListDto> {
    const classNotifiers = await this.prisma.classNotifier.findMany({
      where: {
        userId: user.id,
      },
      include: {
        class: true,
      },
    });

    const data = classNotifiers.map((notifier) => ({
      id: notifier.class.id,
      term: notifier.class.term,
      manaboClassId: notifier.class.manaboClassId,
      courseId: notifier.class.courseId ?? undefined,
    }));

    return { data };
  }
}
