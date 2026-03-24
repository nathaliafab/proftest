import { NextResponse } from 'next/server';
import { CorrectionService } from '../../../services/CorrectionService';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const testId = formData.get('testId') as string;
    const answersFile = formData.get('answers') as File | null;
    const responsesFile = formData.get('responses') as File | null;
    const mode = formData.get('mode') as 'rigorous' | 'proportional' | null;

    if (!testId || typeof testId !== 'string' || !testId.trim()) {
      return NextResponse.json({ error: 'O ID da prova é obrigatório' }, { status: 400 });
    }

    if (!answersFile || typeof answersFile.text !== 'function') {
        return NextResponse.json({ error: 'O arquivo de gabarito é inválido ou ausente' }, { status: 400 });
    }

    if (!responsesFile || typeof responsesFile.text !== 'function') {
        return NextResponse.json({ error: 'O arquivo de respostas é inválido ou ausente' }, { status: 400 });
    }

    if (!mode || (mode !== 'rigorous' && mode !== 'proportional')) {
      return NextResponse.json({ error: 'O modo de correção deve ser "rigorous" ou "proportional"' }, { status: 400 });
    }

    const answersText = await answersFile.text();
    const responsesText = await responsesFile.text();

    if (!answersText.trim()) {
       return NextResponse.json({ error: 'O arquivo de gabarito está vazio' }, { status: 400 });
    }
    
    if (!responsesText.trim()) {
       return NextResponse.json({ error: 'O arquivo de respostas está vazio' }, { status: 400 });
    }

    const service = new CorrectionService();
    // Assuming the CorrectionService might eventually use the testId for validation or fetch it from DB
    const currentReport = await service.grade(answersText, responsesText, mode);

    if (!currentReport) {
        return NextResponse.json({ error: 'Falha ao processar e gerar o relatório' }, { status: 500 });
    }

    return NextResponse.json({ success: true, testId, report: currentReport }, { status: 200 });
  } catch (error) {
    console.error('Test correction error:', error);
    return NextResponse.json({ error: 'Falha ao corrigir as provas, verifique o formato dos arquivos' }, { status: 500 });
  }
}
