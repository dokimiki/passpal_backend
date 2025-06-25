import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { CourseRatingsService } from './course-ratings.service';

@Controller('courses/:courseId/ratings')
export class CourseRatingsController {
  constructor(private readonly courseRatingsService: CourseRatingsService) {}

  @Get()
  async getCourseRatings(
    @Param('courseId') courseId: string,
    @Query('page') page: number = 1,
    @Query('per_page') perPage: number = 20,
    @Query('sort') sort?: string,
  ) {
    return this.courseRatingsService.getCourseRatings(
      courseId,
      page,
      perPage,
      sort,
    );
  }

  @Post()
  async createCourseRating(
    @Param('courseId') courseId: string,
    @Body() ratingDto: { star: number; comment?: string },
  ) {
    return this.courseRatingsService.createCourseRating(
      courseId,
      ratingDto.star,
      ratingDto.comment,
    );
  }

  @Delete()
  async deleteCourseRating(@Param('courseId') courseId: string) {
    return this.courseRatingsService.deleteCourseRating(courseId);
  }
}
