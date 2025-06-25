import { Module } from '@nestjs/common';
import { CourseRatingsController } from './course-ratings.controller';
import { CourseRatingsService } from './course-ratings.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CourseRatingsController],
  providers: [CourseRatingsService],
})
export class CourseRatingsModule {}
