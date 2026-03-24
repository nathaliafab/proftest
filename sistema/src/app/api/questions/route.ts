import { getDb } from '@/lib/db';
import { questionsTable } from '@/lib/schema';
import { Question } from '@/domain/QuestionBank';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.select().from(questionsTable);
    const questions: Question[] = rows.map((row) => ({
      id: row.id,
      description: row.description,
      answers: JSON.parse(row.answers),
    }));
    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Falha ao buscar as questões' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Type validation
    if (!data || typeof data.description !== 'string' || !data.description.trim()) {
      return NextResponse.json({ error: 'A descrição da questão é obrigatória e deve ser um texto válido' }, { status: 400 });
    }
    if (!Array.isArray(data.answers) || data.answers.length === 0) {
      return NextResponse.json({ error: 'A questão deve conter ao menos uma resposta' }, { status: 400 });
    }
    
    // Check if at least one is correct
    if (!data.answers.some((a: any) => a.isCorrect)) {
      return NextResponse.json({ error: 'A questão deve ter pelo menos uma resposta correta' }, { status: 400 });
    }
    
    // Validate answer structure
    for (const answer of data.answers) {
      if (typeof answer.description !== 'string' || !answer.description.trim() || typeof answer.isCorrect !== 'boolean') {
        return NextResponse.json({ error: 'As respostas devem ter uma descrição válida e indicar se estão corretas' }, { status: 400 });
      }
    }

    const db = await getDb();
    const newQuestion: Question = {
      id: uuidv4(),
      description: data.description.trim(),
      answers: data.answers,
    };

    await db.insert(questionsTable).values({
      id: newQuestion.id,
      description: newQuestion.description,
      answers: JSON.stringify(newQuestion.answers)
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error('Error saving question:', error);
    return NextResponse.json({ error: 'Falha ao salvar a questão' }, { status: 500 });
  }
}
