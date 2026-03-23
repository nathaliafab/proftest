import { getDb } from '@/lib/db';
import { testsTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { ExamTest } from '@/domain/Test';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const data = await request.json();
  const db = await getDb();
  
  await db.update(testsTable)
    .set({
      title: data.title,
      questions: JSON.stringify(data.questions)
    })
    .where(eq(testsTable.id, id));
  
  const [row] = await db.select().from(testsTable).where(eq(testsTable.id, id));
  if (!row) return new Response('Not found', { status: 404 });
  
  const updatedTest: ExamTest = {
    id: row.id,
    title: row.title,
    questions: JSON.parse(row.questions),
  };
  return Response.json(updatedTest);
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const db = await getDb();
  await db.delete(testsTable).where(eq(testsTable.id, id));
  return new Response(null, { status: 204 });
}
