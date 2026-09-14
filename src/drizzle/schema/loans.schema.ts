import { pgTable, serial, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
import { studentsTable } from './students.schema';
import { booksTable } from './books.schema';
import { usersTable } from './users.schema';
import { relations } from 'drizzle-orm';

export const loansTable = pgTable('loans', {
  id: serial('id').primaryKey(),
  student_id: integer('student_id').references(() => studentsTable.id).notNull(),
  book_id: integer('book_id').references(() => booksTable.id).notNull(),
  librarian_id: integer('librarian_id').references(() => usersTable.id).notNull(),
  loan_date: timestamp('loan_date').defaultNow().notNull(),
  due_date: timestamp('due_date').notNull(),
  return_date: timestamp('return_date'),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deletedAt'),
});

export const loansRelations = relations(loansTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [loansTable.student_id],
    references: [studentsTable.id],
  }),
  book: one(booksTable, {
    fields: [loansTable.book_id],
    references: [booksTable.id],
  }),
  librarian: one(usersTable, {
    fields: [loansTable.librarian_id],
    references: [usersTable.id],
  }),
}));

export type Loan = typeof loansTable.$inferSelect;
export type InsertLoan = typeof loansTable.$inferInsert;
