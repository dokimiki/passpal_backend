import { Injectable } from '@nestjs/common';

@Injectable()
export class CoursesService {
  async getCourses(page: number, perPage: number) {
    // TODO: Implement courses fetching logic
    return {
      data: [
        {
          id: '018c7e0c-4a7d-7c7e-8df4-6d47afd8c8fc',
          title: '計算機科学概論',
          leadInstructor: '山田 太郎',
        },
      ],
      meta: { page: 1, per_page: 20, total_pages: 1, total_items: 1 },
    };
  }

  async getCourse(courseId: string) {
    // TODO: Implement course fetching logic
    return {
      id: courseId,
      title: '計算機科学概論',
      leadInstructor: '山田 太郎',
    };
  }
}
