import { Test, TestingModule } from '@nestjs/testing';
import { CourseRatingsService } from './course-ratings.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CourseRatingsService', () => {
  let service: CourseRatingsService;
  let prisma: PrismaService;

  const mockCourse = {
    id: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
    title: 'Computer Science',
    leadInstructor: 'John Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCourseRating = {
    courseId: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
    userId: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
    star: 5,
    comment: 'Great course!',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
    },
  };

  const mockPrismaService = {
    course: {
      findUnique: jest.fn(),
    },
    courseRating: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseRatingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CourseRatingsService>(CourseRatingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCourseRatings', () => {
    it('should return paginated course ratings', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.courseRating.count.mockResolvedValue(1);
      mockPrismaService.courseRating.findMany.mockResolvedValue([
        mockCourseRating,
      ]);

      const result = await service.getCourseRatings(
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        1,
        20,
        '-createdAt',
      );

      expect(result).toEqual({
        data: [
          {
            courseId: mockCourseRating.courseId,
            userId: mockCourseRating.userId,
            star: mockCourseRating.star,
            comment: mockCourseRating.comment,
            createdAt: mockCourseRating.createdAt.toISOString(),
            updatedAt: mockCourseRating.updatedAt.toISOString(),
          },
        ],
        meta: {
          page: 1,
          per_page: 20,
          total_pages: 1,
          total_items: 1,
        },
      });
    });

    it('should throw NotFoundException when course does not exist', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(
        service.getCourseRatings('018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc', 1, 20),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCourseRating', () => {
    it('should create a new course rating', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.courseRating.upsert.mockResolvedValue(mockCourseRating);

      const result = await service.createCourseRating(
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        5,
        'Great course!',
      );

      expect(result).toEqual({
        courseId: mockCourseRating.courseId,
        userId: mockCourseRating.userId,
        star: mockCourseRating.star,
        comment: mockCourseRating.comment,
        createdAt: mockCourseRating.createdAt.toISOString(),
        updatedAt: mockCourseRating.updatedAt.toISOString(),
      });
    });

    it('should throw NotFoundException when course does not exist', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(
        service.createCourseRating(
          '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
          '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
          5,
          'Great course!',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCourseRating', () => {
    it('should delete a course rating', async () => {
      mockPrismaService.courseRating.findUnique.mockResolvedValue(
        mockCourseRating,
      );
      mockPrismaService.courseRating.delete.mockResolvedValue(mockCourseRating);

      await service.deleteCourseRating(
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
      );

      expect(mockPrismaService.courseRating.delete).toHaveBeenCalledWith({
        where: {
          courseId_userId: {
            courseId: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
            userId: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
          },
        },
      });
    });

    it('should throw NotFoundException when rating does not exist', async () => {
      mockPrismaService.courseRating.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteCourseRating(
          '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
          '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
