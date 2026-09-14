import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { categoriesTable, booksTable } from '@/drizzle/schema';
import { eq, ilike } from 'drizzle-orm';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private drizzleService: DrizzleService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const db = this.drizzleService.getDb();

    // Check if category with same name already exists
    const existingCategory = await db.query.categoriesTable.findFirst({
      where: eq(categoriesTable.name, createCategoryDto.name),
    });

    if (existingCategory) {
      throw new ConflictException(
        `Category with name "${createCategoryDto.name}" already exists`,
      );
    }

    const result = await db
      .insert(categoriesTable)
      .values({
        ...createCategoryDto,
        created_at: new Date(),
      })
      .returning();

    return result[0];
  }

  async findAll(page: number = 1, limit: number = 10) {
    const db = this.drizzleService.getDb();
    const offset = (page - 1) * limit;

    const categories = await db.query.categoriesTable.findMany({
      limit,
      offset,
      with: {
        books: {
          columns: {
            id: true,
            title: true,
          },
        },
      },
    });

    const total = await db.query.categoriesTable.findMany();

    return {
      data: categories,
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
    const category = await db.query.categoriesTable.findFirst({
      where: eq(categoriesTable.id, id),
      with: {
        books: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }

    return category;
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    const db = this.drizzleService.getDb();
    const offset = (page - 1) * limit;

    const categories = await db.query.categoriesTable.findMany({
      where: ilike(categoriesTable.name, `%${query}%`),
      limit,
      offset,
      with: {
        books: {
          columns: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (categories.length === 0) {
      throw new NotFoundException(`No categories found with query: ${query}`);
    }

    return {
      data: categories,
      pagination: {
        total: categories.length,
        page,
        limit,
        pages: Math.ceil(categories.length / limit),
      },
    };
  }

  async getCategoryStats(id: number) {
    const db = this.drizzleService.getDb();
    const category = await this.findOne(id);

    const books = await db.query.booksTable.findMany({
      where: eq(booksTable.category_id, id),
    });

    const totalBooks = books.length;
    const totalCopies = books.reduce((sum, book) => sum + book.total_quantity, 0);
    const availableCopies = books.reduce(
      (sum, book) => sum + book.available_quantity,
      0,
    );
    const loanedCopies = totalCopies - availableCopies;

    return {
      category: category.name,
      totalBooks,
      totalCopies,
      availableCopies,
      loanedCopies,
      utilizationRate: totalCopies > 0 ? ((loanedCopies / totalCopies) * 100).toFixed(2) : '0.00',
    };
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const db = this.drizzleService.getDb();
    await this.findOne(id);

    // Check if new name is already in use
    if (updateCategoryDto.name) {
      const existingCategory = await db.query.categoriesTable.findFirst({
        where: eq(categoriesTable.name, updateCategoryDto.name),
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(
          `Category with name "${updateCategoryDto.name}" already exists`,
        );
      }
    }

    const result = await db
      .update(categoriesTable)
      .set({
        ...updateCategoryDto,
        updated_at: new Date(),
      })
      .where(eq(categoriesTable.id, id))
      .returning();

    return result[0];
  }

  async remove(id: number) {
    const db = this.drizzleService.getDb();
    const category = await this.findOne(id);

    // Check if category has associated books
    const books = await db.query.booksTable.findMany({
      where: eq(booksTable.category_id, id),
    });

    if (books.length > 0) {
      throw new ConflictException(
        `Cannot delete category "${category.name}" because it has ${books.length} associated book(s)`,
      );
    }

    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));

    return { message: `Category with id ${id} deleted successfully` };
  }
}
