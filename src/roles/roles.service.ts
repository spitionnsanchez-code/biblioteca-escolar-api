import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { rolesTable } from '@/drizzle/schema';
import { eq, isNull } from 'drizzle-orm';
import { CreateRoleDto, UpdateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private drizzleService: DrizzleService) {}

  async create(createRoleDto: CreateRoleDto) {
    const db = this.drizzleService.getDb();

    const existingRole = await db.query.rolesTable.findFirst({
      where: eq(rolesTable.name, createRoleDto.name),
    });

    if (existingRole) {
      throw new ConflictException(`Role ${createRoleDto.name} already exists`);
    }

    const result = await db
      .insert(rolesTable)
      .values(createRoleDto)
      .returning();

    return result[0];
  }

  async findAll() {
    const db = this.drizzleService.getDb();
    return await db.query.rolesTable.findMany();
  }

  async findOne(id: number) {
    const db = this.drizzleService.getDb();
    const role = await db.query.rolesTable.findFirst({
      where: eq(rolesTable.id, id),
    });

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const db = this.drizzleService.getDb();

    const role = await this.findOne(id);

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await db.query.rolesTable.findFirst({
        where: eq(rolesTable.name, updateRoleDto.name),
      });

      if (existingRole) {
        throw new ConflictException(
          `Role ${updateRoleDto.name} already exists`,
        );
      }
    }

    const result = await db
      .update(rolesTable)
      .set(updateRoleDto)
      .where(eq(rolesTable.id, id))
      .returning();

    return result[0];
  }

  async remove(id: number) {
    const db = this.drizzleService.getDb();
    await this.findOne(id);

    await db.delete(rolesTable).where(eq(rolesTable.id, id));

    return { message: `Role with id ${id} deleted successfully` };
  }
}
