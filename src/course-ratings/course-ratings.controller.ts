import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { CourseRatingsService } from './course-ratings.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import {
  CreateCourseRatingDto,
  CourseRatingResponseDto,
  CourseRatingListResponseDto,
} from './dto/course-rating.dto';

@Controller('courses/:courseId/ratings')
export class CourseRatingsController {
  constructor(private readonly courseRatingsService: CourseRatingsService) {}

  @Get()
  async getCourseRatings(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('per_page', new ParseIntPipe({ optional: true }))
    perPage: number = 20,
    @Query('sort') sort?: string,
  ): Promise<CourseRatingListResponseDto> {
    return this.courseRatingsService.getCourseRatings(
      courseId,
      page,
      perPage,
      sort,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCourseRating(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: User,
    @Body() ratingDto: CreateCourseRatingDto,
  ): Promise<CourseRatingResponseDto> {
    return this.courseRatingsService.createCourseRating(
      courseId,
      user.id,
      ratingDto.star,
      ratingDto.comment,
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourseRating(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.courseRatingsService.deleteCourseRating(courseId, user.id);
  }
}
