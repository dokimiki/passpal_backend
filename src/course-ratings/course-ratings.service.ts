import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CourseRatingResponseDto,
  CourseRatingListResponseDto,
} from './dto/course-rating.dto';

@Injectable()
export class CourseRatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCourseRatings(
    courseId: string,
    page: number,
    perPage: number,
    sort?: string,
  ): Promise<CourseRatingListResponseDto> {
    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Parse sort parameter (default: -createdAt)
    const orderBy = this.parseSortParameter(sort || '-createdAt');

    // Calculate offset
    const offset = (page - 1) * perPage;

    // Get total count
    const totalItems = await this.prisma.courseRating.count({
      where: { courseId },
    });

    // Get ratings with pagination
    const ratings = await this.prisma.courseRating.findMany({
      where: { courseId },
      skip: offset,
      take: perPage,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / perPage);

    // Transform to response DTOs
    const data: CourseRatingResponseDto[] = ratings.map((rating) => ({
      courseId: rating.courseId,
      userId: rating.userId,
      star: rating.star,
      comment: rating.comment || undefined,
      createdAt: rating.createdAt.toISOString(),
      updatedAt: rating.updatedAt.toISOString(),
    }));

    return {
      data,
      meta: {
        page,
        per_page: perPage,
        total_pages: totalPages,
        total_items: totalItems,
      },
    };
  }

  async createCourseRating(
    courseId: string,
    userId: string,
    star: number,
    comment?: string,
  ): Promise<CourseRatingResponseDto> {
    // Verify course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Upsert rating (create or update if exists)
    const rating = await this.prisma.courseRating.upsert({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
      update: {
        star,
        comment,
      },
      create: {
        courseId,
        userId,
        star,
        comment,
      },
    });

    return {
      courseId: rating.courseId,
      userId: rating.userId,
      star: rating.star,
      comment: rating.comment || undefined,
      createdAt: rating.createdAt.toISOString(),
      updatedAt: rating.updatedAt.toISOString(),
    };
  }

  async deleteCourseRating(courseId: string, userId: string): Promise<void> {
    // Check if rating exists
    const rating = await this.prisma.courseRating.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    });

    if (!rating) {
      throw new NotFoundException('Course rating not found');
    }

    // Delete the rating
    await this.prisma.courseRating.delete({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    });
  }

  private parseSortParameter(sort: string): Record<string, 'asc' | 'desc'> {
    // Handle sort parameter like '-createdAt', '+star', 'updatedAt'
    const isDescending = sort.startsWith('-');
    const isAscending = sort.startsWith('+');

    let field = sort;
    if (isDescending || isAscending) {
      field = sort.substring(1);
    }

    // Map API field names to database field names
    const fieldMapping: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      star: 'star',
    };

    const dbField = fieldMapping[field] || 'createdAt';
    const direction = isDescending ? 'desc' : 'asc';

    return { [dbField]: direction };
  }
}
