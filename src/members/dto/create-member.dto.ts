import {
  IsString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMemberDto {
  @ApiProperty({
    description: 'Full name of the member',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  full_name: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '555-1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Document ID (DNI, Passport, etc.)',
    example: '12345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  document_id?: string;

  @ApiProperty({
    description: 'Physical address',
    example: '123 Main St',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'City',
    example: 'Springfield',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Member grade or class',
    example: '10A',
    required: false,
  })
  @IsOptional()
  @IsString()
  grade?: string;
}

export class UpdateMemberDto {
  @ApiProperty({
    description: 'Full name of the member',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  full_name?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '555-1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Document ID (DNI, Passport, etc.)',
    example: '12345678',
    required: false,
  })
  @IsOptional()
  @IsString()
  document_id?: string;

  @ApiProperty({
    description: 'Physical address',
    example: '123 Main St',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'City',
    example: 'Springfield',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Member grade or class',
    example: '10A',
    required: false,
  })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({
    description: 'Active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
