import { pgTable, serial, varchar, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { usersTable } from './users.schema';
import { relations } from 'drizzle-orm';

export const booksTable = pgTable(
  'books',
  {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    author: varchar('author', { length: 255 }).notNull(),
    isbn: varchar('isbn', { length: 20 }).unique(),
    category: varchar('category', { length: 100 }),
    total_copies: integer('total_copies').default(1).notNull(),
    available_copies: integer('available_copies').notNull(),
    published_year: integer('published_year'),
    created_by: integer('created_by').references(() => usersTable.id),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deletedAt'),
  },
  (table) => ({
    isbnIdx: uniqueIndex('isbn_idx').on(table.isbn),
  }),
);

export const booksRelations = relations(booksTable, ({ one }) => ({
  creator: one(usersTable, {
    fields: [booksTable.created_by],
    references: [usersTable.id],
  }),
}));

export type Book = typeof booksTable.$inferSelect;
export type InsertBook = typeof booksTable.$inferInsert;
