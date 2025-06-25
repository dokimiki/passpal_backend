import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateNotificationReportDto {
  @IsString()
  manaboDirectoryId: string;

  @IsString()
  manaboAssignmentId: string;

  @IsOptional()
  @IsDateString()
  openAt?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsEnum(['appeared', 'changed', 'disappeared'])
  reportType: 'appeared' | 'changed' | 'disappeared';
}

export class NotificationReportResponseDto {
  id: string;
  assignmentId: string;
  reportType: string;
  createdAt: string;
}
