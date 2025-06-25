import { Controller, Get, Param, Query } from '@nestjs/common';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async getCourses(
    @Query('page') page: number = 1,
    @Query('per_page') perPage: number = 20,
  ) {
    return this.coursesService.getCourses(page, perPage);
  }

  @Get(':courseId')
  async getCourse(@Param('courseId') courseId: string) {
    return this.coursesService.getCourse(courseId);
  }
}
