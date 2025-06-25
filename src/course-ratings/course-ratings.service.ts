import { Injectable } from '@nestjs/common';

@Injectable()
export class CourseRatingsService {
  async getCourseRatings(
    courseId: string,
    page: number,
    perPage: number,
    sort?: string,
  ) {
    // TODO: Implement course ratings fetching logic
    return {
      data: [
        {
          courseId,
          userId: '018c7e0c-aaaa-bbbb-cccc-6d47afd8c8fc',
          star: 4,
          comment: '課題は多いが身になる授業でした',
          createdAt: '2025-04-10T02:14:00Z',
          updatedAt: '2025-04-10T02:14:00Z',
        },
      ],
      meta: { page: 1, per_page: 20, total_pages: 1, total_items: 1 },
    };
  }

  async createCourseRating(courseId: string, star: number, comment?: string) {
    // TODO: Implement course rating creation logic
    return {
      courseId,
      userId: '018c7e0c-aaaa-bbbb-cccc-6d47afd8c8fc',
      star,
      comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteCourseRating(courseId: string) {
    // TODO: Implement course rating deletion logic
    return;
  }
}
