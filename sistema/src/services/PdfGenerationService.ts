import PDFDocument from 'pdfkit';
import AdmZip from 'adm-zip';
import { Question } from '../domain/QuestionBank';
import { ExamTest } from '../domain/Test';

export class PdfGenerationService {
  async generateTestZip(
    testData: ExamTest,
    questionsData: Question[],
    amount: number,
    header: { classTitle: string; professorName: string; date: string }
  ): Promise<Buffer> {
    const zip = new AdmZip();
    let csvContent = 'Test Number,Answers\n';

    for (let i = 1; i <= amount; i++) {
        // Shuffle questions
        const shuffledQuestions = [...questionsData].sort(() => Math.random() - 0.5);
        
        // Arrays to hold correct answers for the CSV
        const testAnswers: string[] = [];

        const doc = new PDFDocument({ margin: 50, bufferPages: true });
        // Set font to Times New Roman (PDFKit uses Times-Roman built-in font)
        doc.font('Times-Roman');
        
        const buffers: Buffer[] = [];
        
        doc.on('data', buffers.push.bind(buffers));

        // Let's defer adding the pdf to zip until doc ends
        const docPromise = new Promise<void>((resolve) => {
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                zip.addFile(`test_${i}.pdf`, pdfData);
                resolve();
            });
        });

        // Add Header
        doc.fontSize(20).text(header.classTitle, { align: 'center' });
        doc.fontSize(14).text(`Professor: ${header.professorName}`, { align: 'center' });
        doc.text(`Data: ${header.date}`, { align: 'center' });
        doc.moveDown(2);

        // Add Questions
        shuffledQuestions.forEach((q, qIndex) => {
            doc.fontSize(12).text(`${qIndex + 1}. ${q.description}`);
            
            // Shuffle answers
            const shuffledAnswers = [...q.answers].sort(() => Math.random() - 0.5);
            
            const qConfig = testData.questions.find(c => c.questionId === q.id);
            const style = qConfig ? qConfig.identifierStyle : 'letters';

            shuffledAnswers.forEach((ans, aIndex) => {
                const letter = style === 'powersOf2' ? Math.pow(2, aIndex).toString() : String.fromCharCode(97 + aIndex); // 'a' + aIndex
                doc.fontSize(11).text(`${letter}) ${ans.description}`, { indent: 20 });
                if (ans.isCorrect) {
                  testAnswers.push(letter);
                }
            });
            
            doc.moveDown(1);
            if (style === 'powersOf2') {
                doc.fontSize(12).text('Somatório: __________________', { indent: 20 });
            } else {
                doc.fontSize(12).text('Resposta: __________________', { indent: 20 });
            }
            doc.moveDown(1);
        });

        // Add Name and CPF form at the bottom of the last page
        doc.moveDown(2);
        doc.fontSize(12).text('Nome: _____________________________________________________');
        doc.moveDown(1);
        doc.text('CPF:  _____________________________________________________');

        // Footer for Test Number
        let pages = doc.bufferedPageRange();
        for (let j = 0; j < pages.count; j++) {
            doc.switchToPage(j);
            
            const bottomMargin = doc.page.margins.bottom;
            doc.page.margins.bottom = 0;
            
            doc.fontSize(10).text(
                `Prova nº ${i}`,
                50,
                doc.page.height - 30,
                { align: 'center', width: doc.page.width - 100, lineBreak: false }
            );
            
            doc.page.margins.bottom = bottomMargin;
        }

        doc.end();
        await docPromise;

        csvContent += `${i},"${testAnswers.join(', ')}"\n`;
    }

    zip.addFile('answers.csv', Buffer.from(csvContent, 'utf8'));
    return zip.toBuffer();
  }
}
