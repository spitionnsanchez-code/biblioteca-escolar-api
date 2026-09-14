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
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/create-notification.dto';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    schema: {
      example: {
        id: 1,
        member_id: 1,
        type: 'LOAN_REMINDER',
        title: 'Recordatorio de devolución',
        message: 'Su préstamo vence en 3 días',
        is_read: false,
        created_at: '2024-09-14T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'memberId', required: false, type: Number })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean })
  @ApiResponse({
    status: 200,
    description: 'List of all notifications with pagination',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('memberId') memberId?: number,
    @Query('isRead') isRead?: boolean,
  ) {
    return this.notificationsService.findAll(page, limit, memberId, isRead);
  }

  @Get('member/:memberId')
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Member notifications',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async getMemberNotifications(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.notificationsService.getMemberNotifications(memberId, page, limit);
  }

  @Get('member/:memberId/unread-count')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Unread notification count',
    schema: {
      example: {
        memberId: 1,
        unreadCount: 3,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async getUnreadCount(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.notificationsService.getUnreadCount(memberId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Notification found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id/read')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('member/:memberId/read-all')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'All member notifications marked as read',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async markAllAsRead(@Param('memberId', ParseIntPipe) memberId: number) {
    return this.notificationsService.markAllAsRead(memberId);
  }

  @Post('loan/:loanId/reminder')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Loan reminder notification created',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  async createLoanReminder(@Param('loanId', ParseIntPipe) loanId: number) {
    return this.notificationsService.createLoanReminder(loanId);
  }

  @Post('loan/:loanId/overdue')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Overdue loan notification created',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  async createOverdueNotification(@Param('loanId', ParseIntPipe) loanId: number) {
    return this.notificationsService.createOverdueNotification(loanId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.remove(id);
  }
}
