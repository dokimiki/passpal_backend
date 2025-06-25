import { Module } from '@nestjs/common';
import { CourseRatingsController } from './course-ratings.controller';
import { CourseRatingsService } from './course-ratings.service';

@Module({
  controllers: [CourseRatingsController],
  providers: [CourseRatingsService],
})
export class CourseRatingsModule {}
