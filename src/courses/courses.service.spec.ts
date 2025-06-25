import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CoursesService', () => {
  let service: CoursesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    course: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCourses', () => {
    it('should return paginated courses list', async () => {
      const mockCourses = [
        {
          id: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
          title: '計算機科学概論',
          leadInstructor: '山田 太郎',
        },
      ];
      const mockCount = 1;

      mockPrismaService.course.findMany.mockResolvedValue(mockCourses);
      mockPrismaService.course.count.mockResolvedValue(mockCount);

      const result = await service.getCourses(1, 20);

      expect(result).toEqual({
        data: mockCourses,
        meta: {
          page: 1,
          per_page: 20,
          total_pages: 1,
          total_items: 1,
        },
      });

      expect(mockPrismaService.course.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 20,
        orderBy: {
          title: 'asc',
        },
        select: {
          id: true,
          title: true,
          leadInstructor: true,
        },
      });
      expect(mockPrismaService.course.count).toHaveBeenCalled();
    });

    it('should handle pagination correctly', async () => {
      const mockCourses: Array<{
        id: string;
        title: string;
        leadInstructor: string;
      }> = [];
      const mockCount = 25;

      mockPrismaService.course.findMany.mockResolvedValue(mockCourses);
      mockPrismaService.course.count.mockResolvedValue(mockCount);

      const result = await service.getCourses(2, 10);

      expect(result.meta).toEqual({
        page: 2,
        per_page: 10,
        total_pages: 3,
        total_items: 25,
      });

      expect(mockPrismaService.course.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: {
          title: 'asc',
        },
        select: {
          id: true,
          title: true,
          leadInstructor: true,
        },
      });
    });
  });

  describe('getCourse', () => {
    it('should return a single course', async () => {
      const mockCourse = {
        id: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
        title: '計算機科学概論',
        leadInstructor: '山田 太郎',
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      const result = await service.getCourse(
        '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
      );

      expect(result).toEqual(mockCourse);
      expect(mockPrismaService.course.findUnique).toHaveBeenCalledWith({
        where: { id: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc' },
        select: {
          id: true,
          title: true,
          leadInstructor: true,
        },
      });
    });

    it('should throw NotFoundException when course not found', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(service.getCourse('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );

      expect(mockPrismaService.course.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
        select: {
          id: true,
          title: true,
          leadInstructor: true,
        },
      });
    });
  });
});
