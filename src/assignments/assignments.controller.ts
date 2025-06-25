import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import {
  AssignmentResponseDto,
  AssignmentListResponseDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from './dto/assignment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get('classes/:classId/assignments')
  async getClassAssignments(
    @Param('classId') classId: string,
    @CurrentUser() user: User,
  ): Promise<AssignmentListResponseDto> {
    return this.assignmentsService.getClassAssignments(classId);
  }

  @Get('assignments/:assignmentId')
  async getAssignment(
    @Param('assignmentId') assignmentId: string,
    @CurrentUser() user: User,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentsService.getAssignment(assignmentId);
  }

  @Post('assignments')
  async createAssignment(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @CurrentUser() user: User,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentsService.createAssignment(createAssignmentDto);
  }

  @Patch('assignments/:assignmentId')
  async updateAssignment(
    @Param('assignmentId') assignmentId: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @CurrentUser() user: User,
  ): Promise<AssignmentResponseDto> {
    return this.assignmentsService.updateAssignment(
      assignmentId,
      updateAssignmentDto,
    );
  }

  @Delete('assignments/:assignmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAssignment(
    @Param('assignmentId') assignmentId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.assignmentsService.deleteAssignment(assignmentId);
  }
}
