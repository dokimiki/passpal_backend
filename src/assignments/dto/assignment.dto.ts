import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { AssignmentStatus } from '@prisma/client';

export class AssignmentResponseDto {
  id: string;
  classId: string;
  manaboDirectoryId: string;
  manaboAssignmentId: string;
  openAt: string | null;
  dueAt: string | null;
  status: AssignmentStatus;
}

export class AssignmentListResponseDto {
  data: AssignmentResponseDto[];
  meta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_items: number;
  };
}

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsString()
  @IsNotEmpty()
  manaboDirectoryId: string;

  @IsString()
  @IsNotEmpty()
  manaboAssignmentId: string;

  @IsOptional()
  @IsDateString()
  openAt?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsEnum(AssignmentStatus)
  status: AssignmentStatus;
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsDateString()
  openAt?: string;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;
}
