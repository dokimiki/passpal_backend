import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, UpdateAssignmentDto } from './dto/assignment.dto';
import { AssignmentStatus } from '@prisma/client';

describe('AssignmentsController', () => {
  let controller: AssignmentsController;
  let service: AssignmentsService;

  const mockAssignmentsService = {
    getClassAssignments: jest.fn(),
    getAssignment: jest.fn(),
    createAssignment: jest.fn(),
    updateAssignment: jest.fn(),
    deleteAssignment: jest.fn(),
  };

  const mockUser = {
    id: '018c7e0c-1111-2222-3333-6d47afd8c8fc',
    firebaseUid: 'test-firebase-uid',
    banned: false,
    banReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentsController],
      providers: [
        {
          provide: AssignmentsService,
          useValue: mockAssignmentsService,
        },
      ],
    }).compile();

    controller = module.get<AssignmentsController>(AssignmentsController);
    service = module.get<AssignmentsService>(AssignmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getClassAssignments', () => {
    it('should return assignments for a class', async () => {
      const classId = '018c7e0c-aaaa-bbbb-cccc-6d47afd8c8fc';
      const expectedResult = {
        data: [
          {
            id: '018c7e0c-dddd-eeee-ffff-6d47afd8c8fc',
            classId,
            manaboDirectoryId: 'week01',
            manaboAssignmentId: 'hw01',
            openAt: '2025-04-12T00:00:00Z',
            dueAt: '2025-04-19T14:59:00Z',
            status: AssignmentStatus.opened,
          },
        ],
        meta: {
          page: 1,
          per_page: 1,
          total_pages: 1,
          total_items: 1,
        },
      };

      mockAssignmentsService.getClassAssignments.mockResolvedValue(
        expectedResult,
      );

      const result = await controller.getClassAssignments(classId, mockUser);

      expect(mockAssignmentsService.getClassAssignments).toHaveBeenCalledWith(
        classId,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getAssignment', () => {
    it('should return a specific assignment', async () => {
      const assignmentId = '018c7e0c-dddd-eeee-ffff-6d47afd8c8fc';
      const expectedResult = {
        id: assignmentId,
        classId: '018c7e0c-aaaa-bbbb-cccc-6d47afd8c8fc',
        manaboDirectoryId: 'week01',
        manaboAssignmentId: 'hw01',
        openAt: '2025-04-12T00:00:00Z',
        dueAt: '2025-04-19T14:59:00Z',
        status: AssignmentStatus.opened,
      };

      mockAssignmentsService.getAssignment.mockResolvedValue(expectedResult);

      const result = await controller.getAssignment(assignmentId, mockUser);

      expect(mockAssignmentsService.getAssignment).toHaveBeenCalledWith(
        assignmentId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when assignment does not exist', async () => {
      const assignmentId = 'non-existent-id';

      mockAssignmentsService.getAssignment.mockRejectedValue(
        new NotFoundException('Assignment not found'),
      );

      await expect(
        controller.getAssignment(assignmentId, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createAssignment', () => {
    it('should create a new assignment', async () => {
      const createDto: CreateAssignmentDto = {
        classId: '018c7e0c-aaaa-bbbb-cccc-6d47afd8c8fc',
        manaboDirectoryId: 'week01',
        manaboAssignmentId: 'hw01',
        openAt: '2025-04-12T00:00:00Z',
        dueAt: '2025-04-19T14:59:00Z',
        status: AssignmentStatus.opened,
      };

      const expectedResult = {
        id: '018c7e0c-dddd-eeee-ffff-6d47afd8c8fc',
        ...createDto,
      };

      mockAssignmentsService.createAssignment.mockResolvedValue(expectedResult);

      const result = await controller.createAssignment(createDto, mockUser);

      expect(mockAssignmentsService.createAssignment).toHaveBeenCalledWith(
        createDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateAssignment', () => {
    it('should update an assignment', async () => {
      const assignmentId = '018c7e0c-dddd-eeee-ffff-6d47afd8c8fc';
      const updateDto: UpdateAssignmentDto = {
        status: AssignmentStatus.deleted,
      };

      const expectedResult = {
        id: assignmentId,
        classId: '018c7e0c-aaaa-bbbb-cccc-6d47afd8c8fc',
        manaboDirectoryId: 'week01',
        manaboAssignmentId: 'hw01',
        openAt: '2025-04-12T00:00:00Z',
        dueAt: '2025-04-19T14:59:00Z',
        status: AssignmentStatus.deleted,
      };

      mockAssignmentsService.updateAssignment.mockResolvedValue(expectedResult);

      const result = await controller.updateAssignment(
        assignmentId,
        updateDto,
        mockUser,
      );

      expect(mockAssignmentsService.updateAssignment).toHaveBeenCalledWith(
        assignmentId,
        updateDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteAssignment', () => {
    it('should delete an assignment', async () => {
      const assignmentId = '018c7e0c-dddd-eeee-ffff-6d47afd8c8fc';

      mockAssignmentsService.deleteAssignment.mockResolvedValue(undefined);

      await controller.deleteAssignment(assignmentId, mockUser);

      expect(mockAssignmentsService.deleteAssignment).toHaveBeenCalledWith(
        assignmentId,
      );
    });
  });
});
