import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DevicesModule } from './devices/devices.module';
import { CoursesModule } from './courses/courses.module';
import { CourseRatingsModule } from './course-ratings/course-ratings.module';
import { ClassesModule } from './classes/classes.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { AttendanceLogsModule } from './attendance-logs/attendance-logs.module';
import { NotificationReportsModule } from './notification-reports/notification-reports.module';
import { FirebaseAuthGuard } from './auth/guards/firebase-auth.guard';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DevicesModule,
    CoursesModule,
    CourseRatingsModule,
    ClassesModule,
    AssignmentsModule,
    AttendanceLogsModule,
    NotificationReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AppModule {}
