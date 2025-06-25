import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCourseRatingDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  star: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CourseRatingResponseDto {
  courseId: string;
  userId: string;
  star: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export class CourseRatingListResponseDto {
  data: CourseRatingResponseDto[];
  meta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_items: number;
  };
}
