import { Module } from '@nestjs/common';
import { NotificationReportsController } from './notification-reports.controller';
import { NotificationReportsService } from './notification-reports.service';
import { FcmService } from './fcm.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationReportsController],
  providers: [NotificationReportsService, FcmService],
  exports: [NotificationReportsService, FcmService],
})
export class NotificationReportsModule {}
