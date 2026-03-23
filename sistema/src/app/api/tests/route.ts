import { getDb } from '@/lib/db';
import { testsTable } from '@/lib/schema';
import { ExamTest } from '@/domain/Test';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const db = await getDb();
  const rows = await db.select().from(testsTable);
  const tests: ExamTest[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    questions: JSON.parse(row.questions),
  }));
  return Response.json(tests);
}

export async function POST(request: Request) {
  const data = await request.json();
  const db = await getDb();
  const newTest: ExamTest = {
    id: uuidv4(),
    title: data.title,
    questions: data.questions,
  };
  await db.insert(testsTable).values({
    id: newTest.id,
    title: newTest.title,
    questions: JSON.stringify(newTest.questions)
  });
  return Response.json(newTest, { status: 201 });
}
