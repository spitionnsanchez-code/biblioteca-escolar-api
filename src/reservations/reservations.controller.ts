import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateReservationDto } from './dto/create-reservation.dto';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Reservations')
@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Reservation created successfully',
    schema: {
      example: {
        id: 1,
        member_id: 1,
        book_id: 1,
        status: 'WAITING',
        queue_position: 1,
        created_at: '2024-09-14T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Member already has reservation' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member or Book not found' })
  async create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'memberId', required: false, type: Number })
  @ApiQuery({ name: 'bookId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'List of all reservations with pagination',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('memberId') memberId?: number,
    @Query('bookId') bookId?: number,
    @Query('status') status?: string,
  ) {
    return this.reservationsService.findAll(page, limit, memberId, bookId, status);
  }

  @Get('member/:memberId')
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Member reservations',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async getMemberReservations(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reservationsService.getMemberReservations(memberId, page, limit);
  }

  @Get('book/:bookId')
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Book reservations',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  async getBookReservations(
    @Param('bookId', ParseIntPipe) bookId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reservationsService.getBookReservations(bookId, page, limit);
  }

  @Get('book/:bookId/availability')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Book availability status',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  async checkAvailability(@Param('bookId', ParseIntPipe) bookId: number) {
    return this.reservationsService.checkAvailability(bookId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Reservation found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.findOne(id);
  }

  @Post(':id/notify')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Member notified of availability',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Book or Reservation not found' })
  async notifyAvailability(@Param('id', ParseIntPipe) bookId: number) {
    return this.reservationsService.notifyAvailability(bookId);
  }

  @Patch(':id/confirm')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Reservation confirmed',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Book not available' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async confirm(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.confirm(id);
  }

  @Patch(':id/cancel')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Reservation cancelled',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Only WAITING reservations can be cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.cancel(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Reservation updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Reservation deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Reservation not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.remove(id);
  }
}
