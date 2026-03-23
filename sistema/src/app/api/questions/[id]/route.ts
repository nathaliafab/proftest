import { getDb } from '@/lib/db';
import { questionsTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { Question } from '@/domain/QuestionBank';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = await request.json();
  const db = await getDb();
  
  await db.update(questionsTable)
    .set({
      description: data.description,
      answers: JSON.stringify(data.answers)
    })
    .where(eq(questionsTable.id, id));
  
  const [row] = await db.select().from(questionsTable).where(eq(questionsTable.id, id));
  if (!row) return new Response('Not found', { status: 404 });
  
  const updatedQuestion: Question = {
    id: row.id,
    description: row.description,
    answers: JSON.parse(row.answers),
  };
  return Response.json(updatedQuestion);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const db = await getDb();
  await db.delete(questionsTable).where(eq(questionsTable.id, id));
  return new Response(null, { status: 204 });
}
