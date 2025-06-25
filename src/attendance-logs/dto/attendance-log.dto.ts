import {
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { Weekday, AttendanceStatus } from '@prisma/client';

export class CreateAttendanceLogDto {
  @IsString()
  @IsNotEmpty()
  term: string;

  @IsDateString()
  recordDate: string;

  @IsEnum(Weekday)
  weekday: Weekday;

  @IsInt()
  @Min(1)
  @Max(5)
  period: number;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class UpdateAttendanceLogDto {
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class AttendanceLogResponseDto {
  id: string;
  term: string;
  recordDate: string;
  weekday: Weekday;
  period: number;
  status: AttendanceStatus;
}

export class GetAttendanceLogsQueryDto {
  @IsString()
  @IsNotEmpty()
  term: string;
}
