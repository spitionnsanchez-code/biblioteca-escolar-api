import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    example: 'LIBRARIAN',
    description: 'Role name',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @ApiProperty({
    example: 'Manages library operations and book loans',
    description: 'Role description',
    required: false,
  })
  @IsString()
  description?: string;
}

export class UpdateRoleDto {
  @ApiProperty({
    example: 'LIBRARIAN_SENIOR',
    description: 'Role name',
    minLength: 3,
    maxLength: 100,
    required: false,
  })
  @IsString()
  @Length(3, 100)
  name?: string;

  @ApiProperty({
    example: 'Senior librarian with full permissions',
    description: 'Role description',
    required: false,
  })
  @IsString()
  description?: string;
}
