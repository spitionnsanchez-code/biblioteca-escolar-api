import { IsInt, IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLoanDto {
  @ApiProperty({
    example: 1,
    description: 'Student ID (foreign key)',
  })
  @IsInt()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: 1,
    description: 'Book ID (foreign key)',
  })
  @IsInt()
  @IsNotEmpty()
  book_id: number;

  @ApiProperty({
    example: 1,
    description: 'Librarian ID (foreign key)',
  })
  @IsInt()
  @IsNotEmpty()
  librarian_id: number;

  @ApiProperty({
    example: '2024-09-21T10:00:00Z',
    description: 'Loan date (ISO 8601 format)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  loan_date?: string;

  @ApiProperty({
    example: '2024-10-05T10:00:00Z',
    description: 'Due date (ISO 8601 format)',
  })
  @IsDateString()
  @IsNotEmpty()
  due_date: string;

  @ApiProperty({
    example: 'active',
    description: 'Loan status (active, returned, overdue)',
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateLoanDto {
  @ApiProperty({
    example: '2024-10-02T15:30:00Z',
    description: 'Return date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  return_date?: string;

  @ApiProperty({
    example: 'returned',
    description: 'Loan status',
    required: false,
  })
  @IsString()
  @IsOptional()
  status?: string;
}
