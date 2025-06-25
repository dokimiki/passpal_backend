import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationReportsService } from './notification-reports.service';
import {
  CreateNotificationReportDto,
  NotificationReportResponseDto,
} from './dto/notification-report.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('notification-reports')
export class NotificationReportsController {
  constructor(
    private readonly notificationReportsService: NotificationReportsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNotificationReport(
    @CurrentUser() user: User,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    reportDto: CreateNotificationReportDto,
  ): Promise<NotificationReportResponseDto> {
    return this.notificationReportsService.createNotificationReport(
      user,
      reportDto,
    );
  }
}
