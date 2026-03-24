import { loadFeature, defineFeature } from 'jest-cucumber';
import { DatabaseTestRepository } from '../../src/repositories/DatabaseTestRepository';
import { DatabaseQuestionBank } from '../../src/repositories/DatabaseQuestionBank';
import { PdfGenerationService } from '../../src/services/PdfGenerationService';
import AdmZip from 'adm-zip';

const feature = loadFeature('tests/features/generate_pdfs.feature');

defineFeature(feature, (test) => {
  let testRepo: DatabaseTestRepository;
  let questionRepo: DatabaseQuestionBank;
  let pdfService: PdfGenerationService;
  let resultBuffer: Buffer;
  let testInstance: any;

  beforeAll(async () => {
    testRepo = new DatabaseTestRepository();
    questionRepo = new DatabaseQuestionBank();
    pdfService = new PdfGenerationService();
    await testRepo.clear();
    await questionRepo.clear();
  });

  test('Generate PDFs and Answer CSV', ({ given, when, then, and }) => {
    given('I have a test repository', () => {});

    given(/^a test exists with title "(.*)" and style "(.*)" containing a question "(.*)" with answers:$/, async (title, style, qDesc, answersTable) => {
      const answers = answersTable.map((row: any) => ({
        description: row.description,
        isCorrect: row.isCorrect === 'true'
      }));
      const question = await questionRepo.addQuestion({ description: qDesc, answers });
      
      testInstance = await testRepo.addTest(title, [
        { questionId: question.id, identifierStyle: style as any }
      ]);
    });

    when(/^I request to generate (\d+) PDFs for the test with header details "(.*)", "(.*)", "(.*)"$/, async (amountStr, classTitle, professorName, date) => {
      const amount = parseInt(amountStr, 10);
      const questionsData = await Promise.all(
        testInstance.questions.map((qConf: any) => questionRepo.getQuestionById(qConf.questionId))
      );
      
      const realQuestions = questionsData.filter(q => q !== null);

      resultBuffer = await pdfService.generateTestZip(
        testInstance,
        realQuestions as any,
        amount,
        { classTitle, professorName, date }
      );
    });

    then(/^I should receive a ZIP file containing (\d+) PDF files$/, (expectedPdfs) => {
      expect(resultBuffer).toBeDefined();
      const zip = new AdmZip(resultBuffer);
      const pdfEntries = zip.getEntries().filter(e => e.entryName.endsWith('.pdf'));
      expect(pdfEntries.length).toBe(parseInt(expectedPdfs, 10));
    });

    and('the ZIP file should contain a CSV file with the answers', () => {
      const zip = new AdmZip(resultBuffer);
      const csvEntry = zip.getEntry('answers.csv');
      expect(csvEntry).not.toBeNull();
      const csvContent = zip.readAsText(csvEntry!);
      expect(csvContent).toContain('Test Number,q1');
    });
  });
});
