import { Test, TestingModule } from '@nestjs/testing';
import { CourseRatingsController } from './course-ratings.controller';
import { CourseRatingsService } from './course-ratings.service';
import { User } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('CourseRatingsController', () => {
  let controller: CourseRatingsController;
  let service: CourseRatingsService;

  const mockUser: User = {
    id: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
    firebaseUid: 'firebase-uid-123',
    banned: false,
    banReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCourseRating = {
    courseId: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
    userId: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
    star: 5,
    comment: 'Great course!',
    createdAt: '2025-04-10T02:14:00Z',
    updatedAt: '2025-04-10T02:14:00Z',
  };

  const mockCourseRatingService = {
    getCourseRatings: jest.fn(),
    createCourseRating: jest.fn(),
    deleteCourseRating: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseRatingsController],
      providers: [
        {
          provide: CourseRatingsService,
          useValue: mockCourseRatingService,
        },
      ],
    }).compile();

    controller = module.get<CourseRatingsController>(CourseRatingsController);
    service = module.get<CourseRatingsService>(CourseRatingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCourseRatings', () => {
    it('should return paginated course ratings', async () => {
      const expectedResult = {
        data: [mockCourseRating],
        meta: {
          page: 1,
          per_page: 20,
          total_pages: 1,
          total_items: 1,
        },
      };

      mockCourseRatingService.getCourseRatings.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getCourseRatings(
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        1,
        20,
        '-createdAt',
      );

      expect(result).toEqual(expectedResult);
      expect(mockCourseRatingService.getCourseRatings).toHaveBeenCalledWith(
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        1,
        20,
        '-createdAt',
      );
    });
  });

  describe('createCourseRating', () => {
    it('should create a new course rating', async () => {
      const createDto = { star: 5, comment: 'Great course!' };

      mockCourseRatingService.createCourseRating.mockResolvedValue(
        mockCourseRating,
      );

      const result = await controller.createCourseRating(
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        mockUser,
        createDto,
      );

      expect(result).toEqual(mockCourseRating);
      expect(mockCourseRatingService.createCourseRating).toHaveBeenCalledWith(
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        mockUser.id,
        5,
        'Great course!',
      );
    });

    it('should create a course rating without comment', async () => {
      const createDto = { star: 4 };
      const expectedRating = {
        ...mockCourseRating,
        star: 4,
        comment: undefined,
      };

      mockCourseRatingService.createCourseRating.mockResolvedValue(
        expectedRating,
      );

      const result = await controller.createCourseRating(
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        mockUser,
        createDto,
      );

      expect(result).toEqual(expectedRating);
      expect(mockCourseRatingService.createCourseRating).toHaveBeenCalledWith(
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        mockUser.id,
        4,
        undefined,
      );
    });
  });

  describe('deleteCourseRating', () => {
    it('should delete a course rating', async () => {
      mockCourseRatingService.deleteCourseRating.mockResolvedValue(undefined);

      await controller.deleteCourseRating(
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        mockUser,
      );

      expect(mockCourseRatingService.deleteCourseRating).toHaveBeenCalledWith(
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        mockUser.id,
      );
    });

    it('should throw NotFoundException when rating not found', async () => {
      mockCourseRatingService.deleteCourseRating.mockRejectedValue(
        new NotFoundException('Course rating not found'),
      );

      await expect(
        controller.deleteCourseRating(
          '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
          mockUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
