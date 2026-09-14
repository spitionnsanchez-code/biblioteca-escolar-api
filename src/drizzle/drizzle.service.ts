import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

@Injectable()
export class DrizzleService {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(private configService: ConfigService) {
    this.initialize();
  }

  private initialize() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    const client = postgres(databaseUrl);
    this.db = drizzle(client, { schema });
  }

  getDb(): PostgresJsDatabase<typeof schema> {
    return this.db;
  }
}
