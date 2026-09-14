import { IsString, IsNotEmpty, IsOptional, IsInt, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    example: 'The Great Gatsby',
    description: 'Book title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'F. Scott Fitzgerald',
    description: 'Book author name',
  })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({
    example: '978-0-7432-7356-5',
    description: 'ISBN (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(10, 20)
  isbn?: string;

  @ApiProperty({
    example: 'Fiction',
    description: 'Book category',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    example: 5,
    description: 'Total copies available',
  })
  @IsInt()
  total_copies: number;

  @ApiProperty({
    example: 5,
    description: 'Available copies for lending',
  })
  @IsInt()
  available_copies: number;

  @ApiProperty({
    example: 1925,
    description: 'Year of publication',
    required: false,
  })
  @IsInt()
  @IsOptional()
  published_year?: number;
}

export class UpdateBookDto {
  @ApiProperty({
    example: 'The Great Gatsby - Special Edition',
    description: 'Book title',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'F. Scott Fitzgerald',
    description: 'Book author',
    required: false,
  })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiProperty({
    example: '978-0-7432-7356-5',
    description: 'ISBN',
    required: false,
  })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiProperty({
    example: 'Classic Literature',
    description: 'Category',
    required: false,
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    example: 10,
    description: 'Total copies',
    required: false,
  })
  @IsInt()
  @IsOptional()
  total_copies?: number;

  @ApiProperty({
    example: 8,
    description: 'Available copies',
    required: false,
  })
  @IsInt()
  @IsOptional()
  available_copies?: number;

  @ApiProperty({
    example: 1925,
    description: 'Publication year',
    required: false,
  })
  @IsInt()
  @IsOptional()
  published_year?: number;
}
