import { Controller, Get, Param } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';

@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get('classes/:classId/assignments')
  async getClassAssignments(@Param('classId') classId: string) {
    return this.assignmentsService.getClassAssignments(classId);
  }

  @Get('assignments/:assignmentId')
  async getAssignment(@Param('assignmentId') assignmentId: string) {
    return this.assignmentsService.getAssignment(assignmentId);
  }
}
