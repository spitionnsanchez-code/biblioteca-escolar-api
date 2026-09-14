import {
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum ReservationStatus {
  WAITING = 'WAITING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export class CreateReservationDto {
  @ApiProperty({
    description: 'Member ID',
    example: 1,
  })
  @IsNumber()
  member_id: number;

  @ApiProperty({
    description: 'Book ID',
    example: 1,
  })
  @IsNumber()
  book_id: number;
}

export class UpdateReservationDto {
  @ApiProperty({
    description: 'Reservation status',
    enum: ReservationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
