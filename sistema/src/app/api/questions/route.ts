import { getDb } from '@/lib/db';
import { questionsTable } from '@/lib/schema';
import { Question } from '@/domain/QuestionBank';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const db = await getDb();
  const rows = await db.select().from(questionsTable);
  const questions: Question[] = rows.map((row) => ({
    id: row.id,
    description: row.description,
    answers: JSON.parse(row.answers),
  }));
  return Response.json(questions);
}

export async function POST(request: Request) {
  const data = await request.json();
  const db = await getDb();
  const newQuestion: Question = {
    id: uuidv4(),
    description: data.description,
    answers: data.answers,
  };
  await db.insert(questionsTable).values({
    id: newQuestion.id,
    description: newQuestion.description,
    answers: JSON.stringify(newQuestion.answers)
  });
  return Response.json(newQuestion, { status: 201 });
}
