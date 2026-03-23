import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const questionsTable = sqliteTable('questions', {
  id: text('id').primaryKey(),
  description: text('description').notNull(),
  answers: text('answers').notNull(),
});

export const testsTable = sqliteTable('tests', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  questions: text('questions').notNull(),
});