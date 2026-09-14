import { pgTable, serial, varchar, timestamp, integer } from 'drizzle-orm/pg-core';
import { rolesTable } from './roles.schema';
import { relations } from 'drizzle-orm';

export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role_id: integer('role_id').references(() => rolesTable.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(usersTable, ({ one }) => ({
  role: one(rolesTable, {
    fields: [usersTable.role_id],
    references: [rolesTable.id],
  }),
}));

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
