import { Module } from '@nestjs/common';
import { AttendanceLogsController } from './attendance-logs.controller';
import { AttendanceLogsService } from './attendance-logs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceLogsController],
  providers: [AttendanceLogsService],
})
export class AttendanceLogsModule {}
