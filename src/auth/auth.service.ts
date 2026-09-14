import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DrizzleService } from '@/drizzle/drizzle.service';
import { usersTable } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private drizzleService: DrizzleService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const db = this.drizzleService.getDb();
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
      with: {
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    };
  }
}
