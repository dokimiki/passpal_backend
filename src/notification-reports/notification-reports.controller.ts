import { Controller, Post, Body } from '@nestjs/common';
import { NotificationReportsService } from './notification-reports.service';

@Controller('notification-reports')
export class NotificationReportsController {
  constructor(
    private readonly notificationReportsService: NotificationReportsService,
  ) {}

  @Post()
  async createNotificationReport(
    @Body()
    reportDto: {
      manaboDirectoryId: string;
      manaboAssignmentId: string;
      openAt?: string;
      dueAt?: string;
      reportType: 'appeared' | 'changed' | 'disappeared';
    },
  ) {
    return this.notificationReportsService.createNotificationReport(reportDto);
  }
}
