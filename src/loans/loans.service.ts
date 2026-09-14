import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { loansTable, booksTable, membersTable } from '@/drizzle/schema';
import { eq, and, isNull, lt } from 'drizzle-orm';
import { CreateLoanDto, UpdateLoanDto } from './dto/create-loan.dto';

@Injectable()
export class LoansService {
  constructor(private drizzleService: DrizzleService) {}

  async create(createLoanDto: CreateLoanDto) {
    const db = this.drizzleService.getDb();

    // Validate book exists and has available quantity
    const book = await db.query.booksTable.findFirst({
      where: eq(booksTable.id, createLoanDto.book_id),
    });

    if (!book) {
      throw new NotFoundException(`Book with id ${createLoanDto.book_id} not found`);
    }

    if (book.available_quantity <= 0) {
      throw new ConflictException(`Book "${book.title}" is not available`);
    }

    // Validate member exists
    const member = await db.query.membersTable.findFirst({
      where: eq(membersTable.id, createLoanDto.member_id),
    });

    if (!member) {
      throw new NotFoundException(`Member with id ${createLoanDto.member_id} not found`);
    }

    // Check if member has overdue loans
    const overdueLoans = await db.query.loansTable.findMany({
      where: and(
        eq(loansTable.member_id, createLoanDto.member_id),
        isNull(loansTable.returned_at),
        lt(loansTable.due_date, new Date()),
      ),
    });

    if (overdueLoans.length > 0) {
      throw new ConflictException(
        `Member has ${overdueLoans.length} overdue loan(s). Please return them first.`,
      );
    }

    // Create loan
    const result = await db
      .insert(loansTable)
      .values({
        ...createLoanDto,
        loaned_at: new Date(),
      })
      .returning();

    // Update book available quantity
    await db
      .update(booksTable)
      .set({
        available_quantity: book.available_quantity - 1,
      })
      .where(eq(booksTable.id, createLoanDto.book_id));

    return result[0];
  }

  async findAll(page: number = 1, limit: number = 10, status?: 'active' | 'returned' | 'overdue') {
    const db = this.drizzleService.getDb();
    const offset = (page - 1) * limit;
    const now = new Date();

    let whereClause;

    if (status === 'active') {
      whereClause = isNull(loansTable.returned_at);
    } else if (status === 'returned') {
      whereClause = isNull(loansTable.returned_at) === false;
    } else if (status === 'overdue') {
      whereClause = and(
        isNull(loansTable.returned_at),
        lt(loansTable.due_date, now),
      );
    }

    const loans = await db.query.loansTable.findMany({
      with: {
        book: true,
        member: true,
      },
      where: whereClause,
      limit,
      offset,
    });

    const total = await db.query.loansTable.findMany({
      where: whereClause,
    });

    return {
      data: loans,
      pagination: {
        total: total.length,
        page,
        limit,
        pages: Math.ceil(total.length / limit),
      },
    };
  }

  async findOne(id: number) {
    const db = this.drizzleService.getDb();
    const loan = await db.query.loansTable.findFirst({
      where: eq(loansTable.id, id),
      with: {
        book: true,
        member: true,
      },
    });

    if (!loan) {
      throw new NotFoundException(`Loan with id ${id} not found`);
    }

    return loan;
  }

  async findByMemberId(memberId: number, page: number = 1, limit: number = 10) {
    const db = this.drizzleService.getDb();
    const offset = (page - 1) * limit;

    // Validate member exists
    const member = await db.query.membersTable.findFirst({
      where: eq(membersTable.id, memberId),
    });

    if (!member) {
      throw new NotFoundException(`Member with id ${memberId} not found`);
    }

    const loans = await db.query.loansTable.findMany({
      where: eq(loansTable.member_id, memberId),
      with: {
        book: true,
      },
      limit,
      offset,
    });

    const total = await db.query.loansTable.findMany({
      where: eq(loansTable.member_id, memberId),
    });

    return {
      data: loans,
      pagination: {
        total: total.length,
        page,
        limit,
        pages: Math.ceil(total.length / limit),
      },
    };
  }

  async returnBook(id: number, returnLoanDto?: UpdateLoanDto) {
    const db = this.drizzleService.getDb();
    const loan = await this.findOne(id);

    if (loan.returned_at) {
      throw new ConflictException(`Loan with id ${id} already returned`);
    }

    const result = await db
      .update(loansTable)
      .set({
        returned_at: new Date(),
        notes: returnLoanDto?.notes,
      })
      .where(eq(loansTable.id, id))
      .returning();

    // Update book available quantity
    const book = loan.book;
    await db
      .update(booksTable)
      .set({
        available_quantity: book.available_quantity + 1,
      })
      .where(eq(booksTable.id, book.id));

    return result[0];
  }

  async renewLoan(id: number) {
    const db = this.drizzleService.getDb();
    const loan = await this.findOne(id);

    if (loan.returned_at) {
      throw new ConflictException(`Cannot renew returned loan`);
    }

    const newDueDate = new Date(loan.due_date);
    newDueDate.setDate(newDueDate.getDate() + 14); // Add 14 days

    const result = await db
      .update(loansTable)
      .set({
        due_date: newDueDate,
      })
      .where(eq(loansTable.id, id))
      .returning();

    return result[0];
  }

  async update(id: number, updateLoanDto: UpdateLoanDto) {
    const db = this.drizzleService.getDb();
    await this.findOne(id);

    const result = await db
      .update(loansTable)
      .set(updateLoanDto)
      .where(eq(loansTable.id, id))
      .returning();

    return result[0];
  }

  async remove(id: number) {
    const db = this.drizzleService.getDb();
    const loan = await this.findOne(id);

    if (!loan.returned_at) {
      throw new ConflictException(`Cannot delete active loan. Return book first.`);
    }

    await db.delete(loansTable).where(eq(loansTable.id, id));

    return { message: `Loan with id ${id} deleted successfully` };
  }
}
