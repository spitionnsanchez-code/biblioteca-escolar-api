import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Library overview statistics',
    schema: {
      example: {
        books: {
          total: 100,
          totalCopies: 250,
          availableCopies: 180,
          loanedCopies: 70,
          utilizationRate: '28.00',
        },
        members: {
          total: 50,
          active: 45,
          inactive: 5,
        },
        loans: {
          total: 100,
          active: 70,
          overdue: 5,
        },
        categories: 15,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  async getLibraryOverview() {
    return this.reportsService.getLibraryOverview();
  }

  @Get('loans')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Loan statistics',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  async getLoanStatistics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let start, end;
    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new BadRequestException('Invalid startDate format');
      }
    }
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new BadRequestException('Invalid endDate format');
      }
    }
    return this.reportsService.getLoanStatistics(start, end);
  }

  @Get('most-borrowed-books')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Most borrowed books',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  async getMostBorrowedBooks(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.reportsService.getMostBorrowedBooks(limit || 10);
  }

  @Get('category-popularity')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Category popularity based on loan count',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  async getCategoryPopularity() {
    return this.reportsService.getCategoryPopularity();
  }

  @Get('member-activity')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Most active members',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  async getMemberActivity(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.reportsService.getMemberActivity(limit || 10);
  }

  @Get('overdue-loans')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'List of overdue loans',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  async getOverdueLoans() {
    return this.reportsService.getOverdueLoans();
  }

  @Get('revenue')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Revenue report including fines',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getRevenueReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    let start, end;
    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        throw new BadRequestException('Invalid startDate format');
      }
    }
    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        throw new BadRequestException('Invalid endDate format');
      }
    }
    return this.reportsService.getRevenueReport(start, end);
  }

  @Get('collection-analysis')
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Collection analysis by category',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or Librarian role required' })
  async getCollectionAnalysis() {
    return this.reportsService.getCollectionAnalysis();
  }
}
