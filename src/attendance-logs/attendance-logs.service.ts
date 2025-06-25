import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAttendanceLogDto,
  UpdateAttendanceLogDto,
  AttendanceLogResponseDto,
} from './dto/attendance-log.dto';
import { User } from '@prisma/client';

@Injectable()
export class AttendanceLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAttendanceLogs(
    term: string,
    userId: string,
  ): Promise<AttendanceLogResponseDto[]> {
    const attendanceLogs = await this.prisma.attendanceLog.findMany({
      where: {
        userId: userId,
        term: term,
      },
      orderBy: [{ recordDate: 'desc' }, { period: 'asc' }],
    });

    return attendanceLogs.map((log) => ({
      id: log.id,
      term: log.term,
      recordDate: log.recordDate.toISOString().split('T')[0],
      weekday: log.weekday,
      period: log.period,
      status: log.status,
    }));
  }

  async createAttendanceLog(
    createAttendanceLogDto: CreateAttendanceLogDto,
    userId: string,
  ): Promise<AttendanceLogResponseDto> {
    // Check if an attendance log already exists for the same user, term, date, and period
    const existingLog = await this.prisma.attendanceLog.findFirst({
      where: {
        userId: userId,
        term: createAttendanceLogDto.term,
        recordDate: new Date(createAttendanceLogDto.recordDate),
        period: createAttendanceLogDto.period,
      },
    });

    if (existingLog) {
      throw new ConflictException(
        'Attendance log already exists for this term, date, and period',
      );
    }

    const attendanceLog = await this.prisma.attendanceLog.create({
      data: {
        userId: userId,
        term: createAttendanceLogDto.term,
        recordDate: new Date(createAttendanceLogDto.recordDate),
        weekday: createAttendanceLogDto.weekday,
        period: createAttendanceLogDto.period,
        status: createAttendanceLogDto.status,
      },
    });

    return {
      id: attendanceLog.id,
      term: attendanceLog.term,
      recordDate: attendanceLog.recordDate.toISOString().split('T')[0],
      weekday: attendanceLog.weekday,
      period: attendanceLog.period,
      status: attendanceLog.status,
    };
  }

  async updateAttendanceLog(
    attendanceLogId: string,
    updateAttendanceLogDto: UpdateAttendanceLogDto,
    userId: string,
  ): Promise<AttendanceLogResponseDto> {
    // First check if the attendance log exists and belongs to the user
    const existingLog = await this.prisma.attendanceLog.findUnique({
      where: { id: attendanceLogId },
    });

    if (!existingLog) {
      throw new NotFoundException('Attendance log not found');
    }

    if (existingLog.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const updatedLog = await this.prisma.attendanceLog.update({
      where: { id: attendanceLogId },
      data: {
        status: updateAttendanceLogDto.status,
      },
    });

    return {
      id: updatedLog.id,
      term: updatedLog.term,
      recordDate: updatedLog.recordDate.toISOString().split('T')[0],
      weekday: updatedLog.weekday,
      period: updatedLog.period,
      status: updatedLog.status,
    };
  }

  async deleteAttendanceLog(
    attendanceLogId: string,
    userId: string,
  ): Promise<void> {
    // First check if the attendance log exists and belongs to the user
    const existingLog = await this.prisma.attendanceLog.findUnique({
      where: { id: attendanceLogId },
    });

    if (!existingLog) {
      throw new NotFoundException('Attendance log not found');
    }

    if (existingLog.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.attendanceLog.delete({
      where: { id: attendanceLogId },
    });
  }
}
