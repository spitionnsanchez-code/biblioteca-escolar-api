import { pgTable, serial, varchar, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { relations } from 'drizzle-orm';

export const studentsTable = pgTable(
  'students',
  {
    id: serial('id').primaryKey(),
    first_name: varchar('first_name', { length: 100 }).notNull(),
    last_name: varchar('last_name', { length: 100 }).notNull(),
    enrollment_number: varchar('enrollment_number', { length: 50 }).unique().notNull(),
    grade: varchar('grade', { length: 20 }).notNull(),
    email: varchar('email', { length: 255 }).unique(),
    phone: varchar('phone', { length: 20 }),
    created_by: integer('created_by').references(() => usersTable.id),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deletedAt'),
  },
  (table) => ({
    enrollmentIdx: uniqueIndex('enrollment_number_idx').on(table.enrollment_number),
    emailIdx: uniqueIndex('student_email_idx').on(table.email),
  }),
);

export const studentsRelations = relations(studentsTable, ({ one }) => ({
  creator: one(usersTable, {
    fields: [studentsTable.created_by],
    references: [usersTable.id],
  }),
}));

export type Student = typeof studentsTable.$inferSelect;
export type InsertStudent = typeof studentsTable.$inferInsert;
