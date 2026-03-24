import { getDb } from '@/lib/db';
import { testsTable } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { ExamTest } from '@/domain/Test';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const data = await request.json();
    
    // Validation
    if (!data || typeof data.title !== 'string' || !data.title.trim()) {
      return NextResponse.json({ error: 'O título da prova é obrigatório e deve ser um texto' }, { status: 400 });
    }
    if (!Array.isArray(data.questions)) {
      return NextResponse.json({ error: 'A lista de questões é inválida' }, { status: 400 });
    }

    const db = await getDb();
    
    await db.update(testsTable)
      .set({
        title: data.title.trim(),
        questions: JSON.stringify(data.questions)
      })
      .where(eq(testsTable.id, id));
    
    const [row] = await db.select().from(testsTable).where(eq(testsTable.id, id));
    if (!row) {
        return NextResponse.json({ error: 'Prova não encontrada' }, { status: 404 });
    }
    
    const updatedTest: ExamTest = {
      id: row.id,
      title: row.title,
      questions: JSON.parse(row.questions),
    };
    return NextResponse.json(updatedTest, { status: 200 });
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json({ error: 'Falha ao atualizar a prova' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.delete(testsTable).where(eq(testsTable.id, id));
    
    // Note: Drizzle behavior might not always throw if deleting 0 rows, 
    // but returning 204 generally means operation successful/idempotent.
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json({ error: 'Falha ao deletar a prova' }, { status: 500 });
  }
}
