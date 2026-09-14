import { IsString, IsNotEmpty, IsOptional, IsInt, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Student first name',
  })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    example: 'García',
    description: 'Student last name',
  })
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    example: 'EST-2024-001',
    description: 'Student enrollment number (unique)',
  })
  @IsString()
  @IsNotEmpty()
  enrollment_number: string;

  @ApiProperty({
    example: '5to Grado A',
    description: 'Grade/Class level',
  })
  @IsString()
  @IsNotEmpty()
  grade: string;

  @ApiProperty({
    example: 'juan.garcia@school.com',
    description: 'Student email (optional, unique)',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '555-1234',
    description: 'Student phone number (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateStudentDto {
  @ApiProperty({
    example: 'Juan',
    description: 'First name',
    required: false,
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({
    example: 'García López',
    description: 'Last name',
    required: false,
  })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({
    example: 'EST-2024-001',
    description: 'Enrollment number',
    required: false,
  })
  @IsString()
  @IsOptional()
  enrollment_number?: string;

  @ApiProperty({
    example: '6to Grado B',
    description: 'Grade/Class level',
    required: false,
  })
  @IsString()
  @IsOptional()
  grade?: string;

  @ApiProperty({
    example: 'juan.garcia@school.com',
    description: 'Email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: '555-5678',
    description: 'Phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;
}
