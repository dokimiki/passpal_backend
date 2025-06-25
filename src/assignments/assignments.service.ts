import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssignmentResponseDto,
  AssignmentListResponseDto,
  CreateAssignmentDto,
  UpdateAssignmentDto,
} from './dto/assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getClassAssignments(
    classId: string,
  ): Promise<AssignmentListResponseDto> {
    // Verify class exists
    const classExists = await this.prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classExists) {
      throw new NotFoundException('Class not found');
    }

    const assignments = await this.prisma.assignment.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
    });

    const data: AssignmentResponseDto[] = assignments.map((assignment) => ({
      id: assignment.id,
      classId: assignment.classId,
      manaboDirectoryId: assignment.manaboDirectoryId,
      manaboAssignmentId: assignment.manaboAssignmentId,
      openAt: assignment.openAt?.toISOString() || null,
      dueAt: assignment.dueAt?.toISOString() || null,
      status: assignment.status,
    }));

    return {
      data,
      meta: {
        page: 1,
        per_page: assignments.length,
        total_pages: 1,
        total_items: assignments.length,
      },
    };
  }

  async getAssignment(assignmentId: string): Promise<AssignmentResponseDto> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return {
      id: assignment.id,
      classId: assignment.classId,
      manaboDirectoryId: assignment.manaboDirectoryId,
      manaboAssignmentId: assignment.manaboAssignmentId,
      openAt: assignment.openAt?.toISOString() || null,
      dueAt: assignment.dueAt?.toISOString() || null,
      status: assignment.status,
    };
  }

  async createAssignment(
    createAssignmentDto: CreateAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    // Verify class exists
    const classExists = await this.prisma.class.findUnique({
      where: { id: createAssignmentDto.classId },
    });

    if (!classExists) {
      throw new NotFoundException('Class not found');
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        classId: createAssignmentDto.classId,
        manaboDirectoryId: createAssignmentDto.manaboDirectoryId,
        manaboAssignmentId: createAssignmentDto.manaboAssignmentId,
        openAt: createAssignmentDto.openAt
          ? new Date(createAssignmentDto.openAt)
          : null,
        dueAt: createAssignmentDto.dueAt
          ? new Date(createAssignmentDto.dueAt)
          : null,
        status: createAssignmentDto.status,
      },
    });

    return {
      id: assignment.id,
      classId: assignment.classId,
      manaboDirectoryId: assignment.manaboDirectoryId,
      manaboAssignmentId: assignment.manaboAssignmentId,
      openAt: assignment.openAt?.toISOString() || null,
      dueAt: assignment.dueAt?.toISOString() || null,
      status: assignment.status,
    };
  }

  async updateAssignment(
    assignmentId: string,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<AssignmentResponseDto> {
    const existingAssignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existingAssignment) {
      throw new NotFoundException('Assignment not found');
    }

    const assignment = await this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(updateAssignmentDto.openAt && {
          openAt: new Date(updateAssignmentDto.openAt),
        }),
        ...(updateAssignmentDto.dueAt && {
          dueAt: new Date(updateAssignmentDto.dueAt),
        }),
        ...(updateAssignmentDto.status && {
          status: updateAssignmentDto.status,
        }),
      },
    });

    return {
      id: assignment.id,
      classId: assignment.classId,
      manaboDirectoryId: assignment.manaboDirectoryId,
      manaboAssignmentId: assignment.manaboAssignmentId,
      openAt: assignment.openAt?.toISOString() || null,
      dueAt: assignment.dueAt?.toISOString() || null,
      status: assignment.status,
    };
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    const existingAssignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!existingAssignment) {
      throw new NotFoundException('Assignment not found');
    }

    await this.prisma.assignment.delete({
      where: { id: assignmentId },
    });
  }
}
