import { Injectable, NotFoundException } from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { loansTable, booksTable, membersTable, categoriesTable } from '@/drizzle/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

@Injectable()
export class ReportsService {
  constructor(private drizzleService: DrizzleService) {}

  async getLibraryOverview() {
    const db = this.drizzleService.getDb();

    // Total books
    const totalBooks = await db.query.booksTable.findMany();
    const totalCopies = totalBooks.reduce((sum, book) => sum + book.total_quantity, 0);
    const availableCopies = totalBooks.reduce(
      (sum, book) => sum + book.available_quantity,
      0,
    );
    const loanedCopies = totalCopies - availableCopies;

    // Total members
    const totalMembers = await db.query.membersTable.findMany();
    const activeMembers = totalMembers.filter((m) => m.status === 'ACTIVE');

    // Total loans
    const totalLoans = await db.query.loansTable.findMany();
    const activeLoans = totalLoans.filter((l) => !l.return_date);
    const overdueLoans = activeLoans.filter((l) => l.due_date < new Date());

    // Total categories
    const totalCategories = await db.query.categoriesTable.findMany();

    return {
      books: {
        total: totalBooks.length,
        totalCopies,
        availableCopies,
        loanedCopies,
        utilizationRate: totalCopies > 0 ? ((loanedCopies / totalCopies) * 100).toFixed(2) : '0.00',
      },
      members: {
        total: totalMembers.length,
        active: activeMembers.length,
        inactive: totalMembers.length - activeMembers.length,
      },
      loans: {
        total: totalLoans.length,
        active: activeLoans.length,
        overdue: overdueLoans.length,
      },
      categories: totalCategories.length,
    };
  }

  async getLoanStatistics(startDate?: Date, endDate?: Date) {
    const db = this.drizzleService.getDb();

    let whereClause;
    if (startDate && endDate) {
      whereClause = and(
        gte(loansTable.loan_date, startDate),
        lte(loansTable.loan_date, endDate),
      );
    }

    const loans = await db.query.loansTable.findMany({
      where: whereClause,
    });

    const totalLoans = loans.length;
    const returnedLoans = loans.filter((l) => l.return_date).length;
    const activeLoans = totalLoans - returnedLoans;
    const overdueLoans = loans.filter(
      (l) => !l.return_date && l.due_date < new Date(),
    ).length;

    const avgLoanDuration =
      returnedLoans > 0
        ? (
            loans
              .filter((l) => l.return_date)
              .reduce(
                (sum, l) => sum + (l.return_date.getTime() - l.loan_date.getTime()) / (1000 * 60 * 60 * 24),
                0,
              ) / returnedLoans
          ).toFixed(2)
        : '0.00';

    return {
      period: startDate && endDate ? { startDate, endDate } : 'All time',
      totalLoans,
      returnedLoans,
      activeLoans,
      overdueLoans,
      returnRate: totalLoans > 0 ? ((returnedLoans / totalLoans) * 100).toFixed(2) : '0.00',
      avgLoanDuration,
    };
  }

  async getMostBorrowedBooks(limit: number = 10) {
    const db = this.drizzleService.getDb();

    const loans = await db.query.loansTable.findMany();

    // Count loans by book
    const bookLoans = new Map<number, number>();
    loans.forEach((loan) => {
      bookLoans.set(loan.book_id, (bookLoans.get(loan.book_id) || 0) + 1);
    });

    // Sort and get top books
    const topBooks = Array.from(bookLoans.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const booksData = await Promise.all(
      topBooks.map(async ([bookId, count]) => {
        const book = await db.query.booksTable.findFirst({
          where: eq(booksTable.id, bookId),
        });
        return {
          ...book,
          borrowCount: count,
        };
      }),
    );

    return booksData;
  }

  async getCategoryPopularity() {
    const db = this.drizzleService.getDb();

    const books = await db.query.booksTable.findMany({
      with: {
        category: true,
      },
    });

    const loans = await db.query.loansTable.findMany();

    // Count loans by category
    const categoryStats = new Map<
      number,
      { category: string; loans: number; books: number }
    >();

    books.forEach((book) => {
      if (book.category_id) {
        if (!categoryStats.has(book.category_id)) {
          categoryStats.set(book.category_id, {
            category: book.category?.name || 'Unknown',
            loans: 0,
            books: 0,
          });
        }
        const stat = categoryStats.get(book.category_id)!;
        stat.books += 1;
      }
    });

    loans.forEach((loan) => {
      const book = books.find((b) => b.id === loan.book_id);
      if (book && book.category_id && categoryStats.has(book.category_id)) {
        categoryStats.get(book.category_id)!.loans += 1;
      }
    });

    return Array.from(categoryStats.values()).sort((a, b) => b.loans - a.loans);
  }

  async getMemberActivity(limit: number = 10) {
    const db = this.drizzleService.getDb();

    const members = await db.query.membersTable.findMany();
    const loans = await db.query.loansTable.findMany();

    // Count loans per member
    const memberLoans = new Map<number, number>();
    loans.forEach((loan) => {
      memberLoans.set(loan.member_id, (memberLoans.get(loan.member_id) || 0) + 1);
    });

    // Get top members
    const topMembers = Array.from(memberLoans.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([memberId, count]) => {
        const member = members.find((m) => m.id === memberId);
        return {
          memberId,
          name: member?.name || 'Unknown',
          email: member?.email || 'N/A',
          loanCount: count,
        };
      });

    return topMembers;
  }

  async getOverdueLoans() {
    const db = this.drizzleService.getDb();

    const loans = await db.query.loansTable.findMany({
      where: and(
        eq(loansTable.return_date, null),
      ),
      with: {
        member: true,
        book: true,
      },
    });

    const overdueLoans = loans.filter((l) => l.due_date < new Date());

    return overdueLoans.map((loan) => ({
      loanId: loan.id,
      memberId: loan.member_id,
      memberName: loan.member?.name || 'Unknown',
      memberEmail: loan.member?.email || 'N/A',
      bookId: loan.book_id,
      bookTitle: loan.book?.title || 'Unknown',
      bookAuthor: loan.book?.author || 'N/A',
      dueDate: loan.due_date,
      daysOverdue: Math.floor(
        (new Date().getTime() - loan.due_date.getTime()) / (1000 * 60 * 60 * 24),
      ),
    }));
  }

  async getRevenueReport(startDate?: Date, endDate?: Date) {
    const db = this.drizzleService.getDb();

    let whereClause;
    if (startDate && endDate) {
      whereClause = and(
        gte(loansTable.loan_date, startDate),
        lte(loansTable.loan_date, endDate),
      );
    }

    const loans = await db.query.loansTable.findMany({
      where: whereClause,
    });

    // Calculate fines (assuming late returns incur fines)
    let totalFines = 0;
    const fineDetails = [];

    loans.forEach((loan) => {
      if (loan.return_date && loan.return_date > loan.due_date) {
        const daysLate = Math.floor(
          (loan.return_date.getTime() - loan.due_date.getTime()) / (1000 * 60 * 60 * 24),
        );
        // Assume fine of 1 unit per day
        const fine = daysLate * 1;
        totalFines += fine;
        fineDetails.push({
          loanId: loan.id,
          daysLate,
          fine,
        });
      }
    });

    return {
      period: startDate && endDate ? { startDate, endDate } : 'All time',
      totalFines,
      totalLoansWithFines: fineDetails.length,
      fineDetails,
    };
  }

  async getCollectionAnalysis() {
    const db = this.drizzleService.getDb();

    const books = await db.query.booksTable.findMany({
      with: {
        category: true,
      },
    });

    const categories = await db.query.categoriesTable.findMany();

    const categoryAnalysis = categories.map((category) => {
      const categoryBooks = books.filter((b) => b.category_id === category.id);
      const totalCopies = categoryBooks.reduce((sum, b) => sum + b.total_quantity, 0);
      const availableCopies = categoryBooks.reduce(
        (sum, b) => sum + b.available_quantity,
        0,
      );

      return {
        categoryId: category.id,
        categoryName: category.name,
        totalBooks: categoryBooks.length,
        totalCopies,
        availableCopies,
        loanedCopies: totalCopies - availableCopies,
        utilizationRate: totalCopies > 0 ? ((totalCopies - availableCopies) / totalCopies * 100).toFixed(2) : '0.00',
      };
    });

    return {
      totalCategories: categories.length,
      totalBooks: books.length,
      totalCopies: books.reduce((sum, b) => sum + b.total_quantity, 0),
      categoryAnalysis,
    };
  }
}
