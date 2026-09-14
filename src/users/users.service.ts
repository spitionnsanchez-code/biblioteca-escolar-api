import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { usersTable } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private drizzleService: DrizzleService) {}

  async create(createUserDto: CreateUserDto) {
    const db = this.drizzleService.getDb();

    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, createUserDto.email),
    });

    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const result = await db
      .insert(usersTable)
      .values({
        ...createUserDto,
        password: hashedPassword,
      })
      .returning();

    const user = result[0];
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll() {
    const db = this.drizzleService.getDb();
    const users = await db.query.usersTable.findMany({
      with: {
        role: true,
      },
    });

    return users.map(({ password, ...user }) => user);
  }

  async findOne(id: number) {
    const db = this.drizzleService.getDb();
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
      with: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const db = this.drizzleService.getDb();

    await this.findOne(id);

    if (updateUserDto.email) {
      const existingUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, updateUserDto.email),
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`User with email ${updateUserDto.email} already exists`);
      }
    }

    const dataToUpdate = { ...updateUserDto };

    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const result = await db
      .update(usersTable)
      .set(dataToUpdate)
      .where(eq(usersTable.id, id))
      .returning();

    const { password, ...userWithoutPassword } = result[0];
    return userWithoutPassword;
  }

  async remove(id: number) {
    const db = this.drizzleService.getDb();
    await this.findOne(id);

    await db.delete(usersTable).where(eq(usersTable.id, id));

    return { message: `User with id ${id} deleted successfully` };
  }
}
