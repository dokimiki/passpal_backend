import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { AttendanceLogsService } from './attendance-logs.service';

@Controller('attendance-logs')
export class AttendanceLogsController {
  constructor(private readonly attendanceLogsService: AttendanceLogsService) {}

  @Get()
  async getAttendanceLogs(@Query('term') term: string) {
    return this.attendanceLogsService.getAttendanceLogs(term);
  }

  @Post()
  async createAttendanceLog(
    @Body()
    attendanceDto: {
      term: string;
      recordDate: string;
      weekday:
        | 'monday'
        | 'tuesday'
        | 'wednesday'
        | 'thursday'
        | 'friday'
        | 'saturday'
        | 'sunday';
      period: number;
      status: 'present' | 'absent' | 'late';
    },
  ) {
    return this.attendanceLogsService.createAttendanceLog(attendanceDto);
  }

  @Patch(':attendanceLogId')
  async updateAttendanceLog(
    @Param('attendanceLogId') attendanceLogId: string,
    @Body() updateDto: { status: 'present' | 'absent' | 'late' },
  ) {
    return this.attendanceLogsService.updateAttendanceLog(
      attendanceLogId,
      updateDto.status,
    );
  }

  @Delete(':attendanceLogId')
  async deleteAttendanceLog(@Param('attendanceLogId') attendanceLogId: string) {
    return this.attendanceLogsService.deleteAttendanceLog(attendanceLogId);
  }
}
