import { IsInt, IsNotEmpty, IsDecimal, IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFineDto {
  @ApiProperty({
    example: 1,
    description: 'Loan ID (foreign key)',
  })
  @IsInt()
  @IsNotEmpty()
  loan_id: number;

  @ApiProperty({
    example: 1,
    description: 'Student ID (foreign key)',
  })
  @IsInt()
  @IsNotEmpty()
  student_id: number;

  @ApiProperty({
    example: '50.00',
    description: 'Fine amount',
  })
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    example: 'Late return - 5 days overdue',
    description: 'Reason for the fine',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    example: '2024-10-10T14:00:00Z',
    description: 'Payment date (ISO 8601 format, optional)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  paid_date?: string;
}

export class UpdateFineDto {
  @ApiProperty({
    example: '50.00',
    description: 'Fine amount',
    required: false,
  })
  @IsNotEmpty()
  amount?: string;

  @ApiProperty({
    example: 'Late return - 10 days overdue (updated)',
    description: 'Reason for the fine',
    required: false,
  })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({
    example: '2024-10-12T10:00:00Z',
    description: 'Payment date',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  paid_date?: string;
}
