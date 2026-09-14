import { IsNumber, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLoanDto {
  @ApiProperty({
    description: 'Book ID',
    example: 1,
  })
  @IsNumber()
  book_id: number;

  @ApiProperty({
    description: 'Member ID',
    example: 1,
  })
  @IsNumber()
  member_id: number;

  @ApiProperty({
    description: 'Loan due date',
    example: '2024-10-14',
  })
  @IsDateString()
  due_date: string;

  @ApiProperty({
    description: 'Notes about the loan',
    example: 'First loan',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLoanDto {
  @ApiProperty({
    description: 'Loan due date',
    example: '2024-10-14',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  due_date?: string;

  @ApiProperty({
    description: 'Notes about the loan',
    example: 'Renewed',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
