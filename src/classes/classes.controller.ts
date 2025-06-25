import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassDto, ClassDto, ClassListDto } from './dto/class.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { AssignmentsService } from '../assignments/assignments.service';
import { AssignmentListResponseDto } from '../assignments/dto/assignment.dto';

@Controller()
export class ClassesController {
  constructor(
    private readonly classesService: ClassesService,
    private readonly assignmentsService: AssignmentsService,
  ) {}

  @Get('class')
  async getClass(
    @Query('manaboClassId') manaboClassId: string,
    @Query('term') term: string,
  ): Promise<ClassDto> {
    return this.classesService.getClass(manaboClassId, term);
  }

  @Post('class')
  async createClass(@Body() classDto: CreateClassDto): Promise<ClassDto> {
    return this.classesService.createClass(classDto);
  }

  @Post('classes/:classId/notifications')
  async subscribeToClassNotifications(
    @Param('classId') classId: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    return this.classesService.subscribeToClassNotifications(classId, user);
  }

  @Delete('classes/:classId/notifications')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsubscribeFromClassNotifications(
    @Param('classId') classId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.classesService.unsubscribeFromClassNotifications(classId, user);
  }

  @Get('classes/notified')
  async getNotifiedClasses(@CurrentUser() user: User): Promise<ClassListDto> {
    return this.classesService.getNotifiedClasses(user);
  }

  @Get('classes/:classId/assignments')
  async getClassAssignments(
    @Param('classId') classId: string,
  ): Promise<AssignmentListResponseDto> {
    return this.assignmentsService.getClassAssignments(classId);
  }
}
