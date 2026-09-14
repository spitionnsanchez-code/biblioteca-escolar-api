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
import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/create-member.dto';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Members')
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Member created successfully',
    schema: {
      example: {
        id: 1,
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        document_id: '12345678',
        address: '123 Main St',
        city: 'Springfield',
        is_active: true,
        joined_at: '2024-09-14T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 409, description: 'Member with this email or document already exists' })
  async create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive'] })
  @ApiResponse({
    status: 200,
    description: 'List of all members with pagination',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: 'active' | 'inactive',
  ) {
    return this.membersService.findAll(page, limit, status);
  }

  @Get('search/:query')
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Search results for members',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No members found' })
  async search(
    @Param('query') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.membersService.search(query, page, limit);
  }

  @Get('email/:email')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Member found by email',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async findByEmail(@Param('email') email: string) {
    return this.membersService.findByEmail(email);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Member found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Member updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 409, description: 'Email or document already in use' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Member deactivated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Member activated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async activate(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.activate(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Member deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.membersService.remove(id);
  }
}
