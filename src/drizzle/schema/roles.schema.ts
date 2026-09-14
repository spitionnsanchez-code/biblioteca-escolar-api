import { pgTable, serial, varchar, timestamp } from 'drizzle-orm/pg-core';

export const rolesTable = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  description: varchar('description', { length: 500 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export type Role = typeof rolesTable.$inferSelect;
export type InsertRole = typeof rolesTable.$inferInsert;
