import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { membersTable } from '@/drizzle/schema';
import { eq, ilike } from 'drizzle-orm';
import { CreateMemberDto, UpdateMemberDto } from './dto/create-member.dto';

@Injectable()
export class MembersService {
  constructor(private drizzleService: DrizzleService) {}

  async create(createMemberDto: CreateMemberDto) {
    const db = this.drizzleService.getDb();

    // Check if member with same email already exists
    const existingMember = await db.query.membersTable.findFirst({
      where: eq(membersTable.email, createMemberDto.email),
    });

    if (existingMember) {
      throw new ConflictException(`Member with email ${createMemberDto.email} already exists`);
    }

    // Check if member with same document already exists
    if (createMemberDto.document_id) {
      const existingDocument = await db.query.membersTable.findFirst({
        where: eq(membersTable.document_id, createMemberDto.document_id),
      });

      if (existingDocument) {
        throw new ConflictException(
          `Member with document ${createMemberDto.document_id} already exists`,
        );
      }
    }

    const result = await db
      .insert(membersTable)
      .values({
        ...createMemberDto,
        joined_at: new Date(),
      })
      .returning();

    return result[0];
  }

  async findAll(page: number = 1, limit: number = 10, status?: 'active' | 'inactive') {
    const db = this.drizzleService.getDb();
    const offset = (page - 1) * limit;

    let whereClause;
    if (status === 'active') {
      whereClause = eq(membersTable.is_active, true);
    } else if (status === 'inactive') {
      whereClause = eq(membersTable.is_active, false);
    }

    const members = await db.query.membersTable.findMany({
      where: whereClause,
      limit,
      offset,
    });

    const total = await db.query.membersTable.findMany({
      where: whereClause,
    });

    return {
      data: members,
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
    const member = await db.query.membersTable.findFirst({
      where: eq(membersTable.id, id),
    });

    if (!member) {
      throw new NotFoundException(`Member with id ${id} not found`);
    }

    return member;
  }

  async search(query: string, page: number = 1, limit: number = 10) {
    const db = this.drizzleService.getDb();
    const offset = (page - 1) * limit;

    const members = await db.query.membersTable.findMany({
      where: ilike(membersTable.full_name, `%${query}%`),
      limit,
      offset,
    });

    if (members.length === 0) {
      throw new NotFoundException(`No members found with query: ${query}`);
    }

    return {
      data: members,
      pagination: {
        total: members.length,
        page,
        limit,
        pages: Math.ceil(members.length / limit),
      },
    };
  }

  async findByEmail(email: string) {
    const db = this.drizzleService.getDb();
    const member = await db.query.membersTable.findFirst({
      where: eq(membersTable.email, email),
    });

    if (!member) {
      throw new NotFoundException(`Member with email ${email} not found`);
    }

    return member;
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    const db = this.drizzleService.getDb();
    const member = await this.findOne(id);

    // Check if new email is already in use
    if (updateMemberDto.email && updateMemberDto.email !== member.email) {
      const existingMember = await db.query.membersTable.findFirst({
        where: eq(membersTable.email, updateMemberDto.email),
      });

      if (existingMember) {
        throw new ConflictException(
          `Member with email ${updateMemberDto.email} already exists`,
        );
      }
    }

    // Check if new document is already in use
    if (
      updateMemberDto.document_id &&
      updateMemberDto.document_id !== member.document_id
    ) {
      const existingDocument = await db.query.membersTable.findFirst({
        where: eq(membersTable.document_id, updateMemberDto.document_id),
      });

      if (existingDocument) {
        throw new ConflictException(
          `Member with document ${updateMemberDto.document_id} already exists`,
        );
      }
    }

    const result = await db
      .update(membersTable)
      .set(updateMemberDto)
      .where(eq(membersTable.id, id))
      .returning();

    return result[0];
  }

  async deactivate(id: number) {
    const db = this.drizzleService.getDb();
    await this.findOne(id);

    const result = await db
      .update(membersTable)
      .set({ is_active: false })
      .where(eq(membersTable.id, id))
      .returning();

    return result[0];
  }

  async activate(id: number) {
    const db = this.drizzleService.getDb();
    await this.findOne(id);

    const result = await db
      .update(membersTable)
      .set({ is_active: true })
      .where(eq(membersTable.id, id))
      .returning();

    return result[0];
  }

  async remove(id: number) {
    const db = this.drizzleService.getDb();
    await this.findOne(id);

    await db.delete(membersTable).where(eq(membersTable.id, id));

    return { message: `Member with id ${id} deleted successfully` };
  }
}
