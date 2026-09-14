import { IsString, IsEmail, IsNotEmpty, MinLength, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address (must be unique)',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 1,
    description: 'Role ID (foreign key to roles table)',
  })
  @IsInt()
  @IsNotEmpty()
  role_id: number;
}

export class UpdateUserDto {
  @ApiProperty({
    example: 'John Doe Updated',
    description: 'User full name',
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'john.updated@example.com',
    description: 'User email address',
    required: false,
  })
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'User password',
    minLength: 6,
    required: false,
  })
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({
    example: 2,
    description: 'Role ID',
    required: false,
  })
  @IsInt()
  role_id?: number;
}
