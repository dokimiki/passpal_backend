import { Module } from '@nestjs/common';
import { NotificationReportsController } from './notification-reports.controller';
import { NotificationReportsService } from './notification-reports.service';

@Module({
  controllers: [NotificationReportsController],
  providers: [NotificationReportsService],
})
export class NotificationReportsModule {}
