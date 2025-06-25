import {
  Controller,
  Get,
  Param,
  Query,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import {
  CourseListQueryDto,
  CourseDto,
  CourseListResponseDto,
} from './dto/course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async getCourses(
    @Query(new ValidationPipe({ transform: true })) query: CourseListQueryDto,
  ): Promise<CourseListResponseDto> {
    return this.coursesService.getCourses(
      query.page || 1,
      query.per_page || 20,
    );
  }

  @Get(':courseId')
  async getCourse(
    @Param('courseId', ParseUUIDPipe) courseId: string,
  ): Promise<CourseDto> {
    return this.coursesService.getCourse(courseId);
  }
}
