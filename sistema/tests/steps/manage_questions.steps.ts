import { loadFeature, defineFeature } from 'jest-cucumber';
import { DatabaseQuestionBank } from '../../src/repositories/DatabaseQuestionBank';
import { Question, Answer } from '../../src/domain/QuestionBank';

const feature = loadFeature('tests/features/manage_questions.feature');

defineFeature(feature, (test) => {
  let bank: DatabaseQuestionBank;

  beforeAll(async () => {
    bank = new DatabaseQuestionBank();
  });

  beforeEach(async () => {
    await bank.clear();
  });

  test('Add a new multiple choice question', ({ given, when, then, and }) => {
    given('I have a question bank', () => {
      // Setup done in beforeEach
    });

    when(/^I add a question with description "(.*)" and answers:$/, async (description: string, table: Answer[]) => {
      const answers = table.map((row: any) => ({
        description: row.description,
        isCorrect: row.isCorrect === 'true',
      }));
      await bank.addQuestion({
        description,
        answers,
      });
    });

    then(/^the question bank should contain (\d+) question$/, async (count: string) => {
      const questions = await bank.getQuestions();
      expect(questions.length).toBe(parseInt(count, 10));
    });

    and(/^the first question should have the description "(.*)"$/, async (description: string) => {
      const questions = await bank.getQuestions();
      expect(questions[0].description).toBe(description);
    });
  });

  test('Modify an existing multiple choice question', ({ given, when, then, and }) => {
    given(/^I have a question bank with a question "(.*)"$/, async (description: string) => {
      await bank.addQuestion({
        description,
        answers: [],
      });
    });

    when(/^I modify the question "(.*)" to have description "(.*)" and answers:$/, async (oldDescription: string, newDescription: string, table: Answer[]) => {
      const question = await bank.getQuestionByDescription(oldDescription);
      if (question) {
        const answers = table.map((row: any) => ({
          description: row.description,
          isCorrect: row.isCorrect === 'true',
        }));
        await bank.modifyQuestion(question.id, newDescription, answers);
      }
    });

    then(/^the question bank should contain (\d+) question$/, async (count: string) => {
      const questions = await bank.getQuestions();
      expect(questions.length).toBe(parseInt(count, 10));
    });

    and(/^the first question should have the description "(.*)"$/, async (description: string) => {
      const questions = await bank.getQuestions();
      expect(questions[0].description).toBe(description);
    });

    and(/^the first question should have (\d+) answers$/, async (count: string) => {
      const questions = await bank.getQuestions();
      expect(questions[0].answers.length).toBe(parseInt(count, 10));
    });
  });

  test('Remove an existing multiple choice question', ({ given, when, then }) => {
    given(/^I have a question bank with a question "(.*)"$/, async (description: string) => {
      await bank.addQuestion({
        description,
        answers: [],
      });
    });

    when(/^I remove the question "(.*)"$/, async (description: string) => {
      const question = await bank.getQuestionByDescription(description);
      if (question) {
        await bank.removeQuestion(question.id);
      }
    });

    then(/^the question bank should contain (\d+) questions$/, async (count: string) => {
      const questions = await bank.getQuestions();
      expect(questions.length).toBe(parseInt(count, 10));
    });
  });
});
