import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { AttendanceLogsService } from './attendance-logs.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import {
  CreateAttendanceLogDto,
  UpdateAttendanceLogDto,
  GetAttendanceLogsQueryDto,
} from './dto/attendance-log.dto';

@Controller('attendance-logs')
export class AttendanceLogsController {
  constructor(private readonly attendanceLogsService: AttendanceLogsService) {}

  @Get()
  async getAttendanceLogs(
    @Query('term') term: string,
    @CurrentUser() user: User,
  ) {
    if (!term) {
      throw new BadRequestException('Term parameter is required');
    }
    return this.attendanceLogsService.getAttendanceLogs(term, user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAttendanceLog(
    @Body() createAttendanceLogDto: CreateAttendanceLogDto,
    @CurrentUser() user: User,
  ) {
    return this.attendanceLogsService.createAttendanceLog(
      createAttendanceLogDto,
      user.id,
    );
  }

  @Patch(':attendanceLogId')
  async updateAttendanceLog(
    @Param('attendanceLogId', ParseUUIDPipe) attendanceLogId: string,
    @Body() updateAttendanceLogDto: UpdateAttendanceLogDto,
    @CurrentUser() user: User,
  ) {
    return this.attendanceLogsService.updateAttendanceLog(
      attendanceLogId,
      updateAttendanceLogDto,
      user.id,
    );
  }

  @Delete(':attendanceLogId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAttendanceLog(
    @Param('attendanceLogId', ParseUUIDPipe) attendanceLogId: string,
    @CurrentUser() user: User,
  ) {
    return this.attendanceLogsService.deleteAttendanceLog(
      attendanceLogId,
      user.id,
    );
  }
}
