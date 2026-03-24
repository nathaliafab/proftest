import { NextResponse } from 'next/server';
import { CorrectionService } from '../../../services/CorrectionService';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const testId = formData.get('testId') as string;
    const answersFile = formData.get('answers') as File;
    const responsesFile = formData.get('responses') as File;
    const mode = formData.get('mode') as 'rigorous' | 'proportional';

    if (!testId || !answersFile || !responsesFile || !mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const answersText = await answersFile.text();
    const responsesText = await responsesFile.text();

    const service = new CorrectionService();
    // Assuming the CorrectionService might eventually use the testId for validation or fetch it from DB
    const currentReport = await service.grade(answersText, responsesText, mode);

    return NextResponse.json({ success: true, testId, report: currentReport }, { status: 200 });
  } catch (error) {
    console.error('Test correction error:', error);
    return NextResponse.json({ error: 'Failed to correct tests' }, { status: 500 });
  }
}
