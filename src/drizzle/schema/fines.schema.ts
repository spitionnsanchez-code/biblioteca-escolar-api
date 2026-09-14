import { pgTable, serial, integer, decimal, varchar, timestamp } from 'drizzle-orm/pg-core';
import { loansTable } from './loans.schema';
import { studentsTable } from './students.schema';
import { usersTable } from './users.schema';
import { relations } from 'drizzle-orm';

export const finesTable = pgTable('fines', {
  id: serial('id').primaryKey(),
  loan_id: integer('loan_id').references(() => loansTable.id).notNull(),
  student_id: integer('student_id').references(() => studentsTable.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  reason: varchar('reason', { length: 255 }).notNull(),
  paid_date: timestamp('paid_date'),
  created_by: integer('created_by').references(() => usersTable.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deletedAt'),
});

export const finesRelations = relations(finesTable, ({ one }) => ({
  loan: one(loansTable, {
    fields: [finesTable.loan_id],
    references: [loansTable.id],
  }),
  student: one(studentsTable, {
    fields: [finesTable.student_id],
    references: [studentsTable.id],
  }),
  creator: one(usersTable, {
    fields: [finesTable.created_by],
    references: [usersTable.id],
  }),
}));

export type Fine = typeof finesTable.$inferSelect;
export type InsertFine = typeof finesTable.$inferInsert;
