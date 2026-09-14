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
import { LoansService } from './loans.service';
import { CreateLoanDto, UpdateLoanDto } from './dto/create-loan.dto';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Loans')
@Controller('loans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Loan created successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Book or Member not found' })
  @ApiResponse({ status: 409, description: 'Book not available or member has overdue loans' })
  async create(@Body() createLoanDto: CreateLoanDto) {
    return this.loansService.create(createLoanDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'returned', 'overdue'] })
  @ApiResponse({
    status: 200,
    description: 'List of all loans',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status?: 'active' | 'returned' | 'overdue',
  ) {
    return this.loansService.findAll(page, limit, status);
  }

  @Get('member/:memberId')
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Loans by member',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async findByMemberId(
    @Param('memberId', ParseIntPipe) memberId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.loansService.findByMemberId(memberId, page, limit);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Loan found',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.findOne(id);
  }

  @Patch(':id/return')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Book returned successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiResponse({ status: 409, description: 'Loan already returned' })
  async returnBook(
    @Param('id', ParseIntPipe) id: number,
    @Body() returnLoanDto?: UpdateLoanDto,
  ) {
    return this.loansService.returnBook(id, returnLoanDto);
  }

  @Patch(':id/renew')
  @Roles('ADMIN', 'LIBRARIAN', 'USER')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Loan renewed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiResponse({ status: 409, description: 'Cannot renew returned loan' })
  async renewLoan(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.renewLoan(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Loan updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoanDto: UpdateLoanDto,
  ) {
    return this.loansService.update(id, updateLoanDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiResponse({ status: 204, description: 'Loan deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 404, description: 'Loan not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete active loan' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.loansService.remove(id);
  }
}
