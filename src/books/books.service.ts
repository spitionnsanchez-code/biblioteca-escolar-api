import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { booksTable } from '@/drizzle/schema';
import { eq, ilike } from 'drizzle-orm';
import { CreateBookDto, UpdateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(private drizzleService: DrizzleService) {}

  async create(createBookDto: CreateBookDto) {
    const db = this.drizzleService.getDb();

    const existingBook = await db.query.booksTable.findFirst({
      where: eq(booksTable.isbn, createBookDto.isbn),
    });

    if (existingBook) {
      throw new ConflictException(`Book with ISBN ${createBookDto.isbn} already exists`);
    }

    const result = await db
      .insert(booksTable)
      .values(createBookDto)
      .returning();

    return result[0];
  }

  async findAll(page: number = 1, limit: number = 10) {
    const db = this.drizzleService.getDb();
    const offset = (page - 1) * limit;

    const books = await db.query.booksTable.findMany({
      limit,
      offset,
    });

    const total = await db.query.booksTable.findMany();

    return {
      data: books,
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
    const book = await db.query.booksTable.findFirst({
      where: eq(booksTable.id, id),
    });

    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    return book;
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    const db = this.drizzleService.getDb();
    const offset = (page - 1) * limit;

    const books = await db.query.booksTable.findMany({
      where: ilike(booksTable.title, `%${query}%`),
      limit,
      offset,
    });

    if (books.length === 0) {
      throw new NotFoundException(`No books found with query: ${query}`);
    }

    return {
      data: books,
      pagination: {
        total: books.length,
        page,
        limit,
        pages: Math.ceil(books.length / limit),
      },
    };
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const db = this.drizzleService.getDb();

    const book = await this.findOne(id);

    if (updateBookDto.isbn && updateBookDto.isbn !== book.isbn) {
      const existingBook = await db.query.booksTable.findFirst({
        where: eq(booksTable.isbn, updateBookDto.isbn),
      });

      if (existingBook) {
        throw new ConflictException(`Book with ISBN ${updateBookDto.isbn} already exists`);
      }
    }

    const result = await db
      .update(booksTable)
      .set(updateBookDto)
      .where(eq(booksTable.id, id))
      .returning();

    return result[0];
  }

  async remove(id: number) {
    const db = this.drizzleService.getDb();
    await this.findOne(id);

    await db.delete(booksTable).where(eq(booksTable.id, id));

    return { message: `Book with id ${id} deleted successfully` };
  }
}
