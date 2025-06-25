import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourseDto, CourseListResponseDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourses(
    page: number,
    perPage: number,
  ): Promise<CourseListResponseDto> {
    const skip = (page - 1) * perPage;

    const [courses, totalItems] = await Promise.all([
      this.prisma.course.findMany({
        skip,
        take: perPage,
        orderBy: {
          title: 'asc',
        },
        select: {
          id: true,
          title: true,
          leadInstructor: true,
        },
      }),
      this.prisma.course.count(),
    ]);

    const totalPages = Math.ceil(totalItems / perPage);

    return {
      data: courses.map((course) => ({
        id: course.id,
        title: course.title,
        leadInstructor: course.leadInstructor,
      })),
      meta: {
        page,
        per_page: perPage,
        total_pages: totalPages,
        total_items: totalItems,
      },
    };
  }

  async getCourse(courseId: string): Promise<CourseDto> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        leadInstructor: true,
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return {
      id: course.id,
      title: course.title,
      leadInstructor: course.leadInstructor,
    };
  }
}
