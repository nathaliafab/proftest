import { getDb, clearDb } from '../lib/db';
import { testsTable } from '../lib/schema';
import { eq } from 'drizzle-orm';
import { ExamTest, TestQuestionConfig } from '../domain/Test';
import { v4 as uuidv4 } from 'uuid';

export class DatabaseTestRepository {
  async addTest(title: string, questions: TestQuestionConfig[]): Promise<ExamTest> {
    const db = await getDb();
    const id = uuidv4();
    const newTest: ExamTest = { id, title, questions };
    await db.insert(testsTable).values({
      id: newTest.id,
      title: newTest.title,
      questions: JSON.stringify(newTest.questions)
    });
    return newTest;
  }

  async modifyTest(id: string, title: string, questions: TestQuestionConfig[]): Promise<void> {
    const db = await getDb();
    await db.update(testsTable)
      .set({
        title,
        questions: JSON.stringify(questions)
      })
      .where(eq(testsTable.id, id));
  }

  async removeTest(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(testsTable).where(eq(testsTable.id, id));
  }

  async getTests(): Promise<ExamTest[]> {
    const db = await getDb();
    const rows = await db.select().from(testsTable);
    return rows.map(r => ({
      id: r.id,
      title: r.title,
      questions: JSON.parse(r.questions)
    }));
  }

  async getTestByTitle(title: string): Promise<ExamTest | undefined> {
    const db = await getDb();
    const [row] = await db.select().from(testsTable).where(eq(testsTable.title, title));
    if (!row) return undefined;
    return {
      id: row.id,
      title: row.title,
      questions: JSON.parse(row.questions)
    };
  }

  async clear(): Promise<void> {
    await clearDb();
  }
}
