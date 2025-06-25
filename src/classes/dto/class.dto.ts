import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  manaboClassId: string;

  @IsString()
  @IsNotEmpty()
  term: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  leadInstructor: string;
}

export class ClassDto {
  @IsUUID()
  id: string;

  @IsString()
  term: string;

  @IsString()
  manaboClassId: string;

  @IsUUID()
  @IsOptional()
  courseId?: string | null;
}

export class ClassListDto {
  data: ClassDto[];
}
