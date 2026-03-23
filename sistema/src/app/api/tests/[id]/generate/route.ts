import { NextResponse } from 'next/server';
import { DatabaseTestRepository } from '../../../../../repositories/DatabaseTestRepository';
import { DatabaseQuestionBank } from '../../../../../repositories/DatabaseQuestionBank';
import { PdfGenerationService } from '../../../../../services/PdfGenerationService';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const url = new URL(request.url);
  
  const amountStr = url.searchParams.get('amount') || '1';
  const amount = parseInt(amountStr, 10) || 1;
  const classTitle = url.searchParams.get('classTitle') || 'Class Title';
  const professorName = url.searchParams.get('professorName') || 'Professor Name';
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

  const testRepo = new DatabaseTestRepository();
  const questionRepo = new DatabaseQuestionBank();
  
  const tests = await testRepo.getTests();
  const testInstance = tests.find(t => t.id === id);

  if (!testInstance) {
    return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  }

  const questionsData = await Promise.all(
    testInstance.questions.map(qConf => questionRepo.getQuestionById(qConf.questionId))
  );

  const validQuestions = questionsData.filter(q => q !== undefined) as any;

  const pdfService = new PdfGenerationService();
  const buffer = await pdfService.generateTestZip(
    testInstance,
    validQuestions,
    amount,
    { classTitle, professorName, date }
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="tests_${id}.zip"`
    }
  });
}