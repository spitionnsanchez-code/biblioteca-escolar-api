import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum NotificationType {
  LOAN_REMINDER = 'LOAN_REMINDER',
  LOAN_OVERDUE = 'LOAN_OVERDUE',
  BOOK_AVAILABLE = 'BOOK_AVAILABLE',
  GENERAL = 'GENERAL',
  SYSTEM = 'SYSTEM',
}

enum ReferenceType {
  LOAN = 'LOAN',
  BOOK = 'BOOK',
  RESERVATION = 'RESERVATION',
  MEMBER = 'MEMBER',
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Member ID',
    example: 1,
  })
  @IsNumber()
  member_id: number;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: 'LOAN_REMINDER',
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Recordatorio de devolución',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Su préstamo vence en 3 días',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  message: string;

  @ApiProperty({
    description: 'Reference type',
    enum: ReferenceType,
    example: 'LOAN',
    required: false,
  })
  @IsOptional()
  @IsEnum(ReferenceType)
  reference_type?: ReferenceType;

  @ApiProperty({
    description: 'Reference ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  reference_id?: number;
}

export class UpdateNotificationDto {
  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    description: 'Notification message',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  message?: string;
}
