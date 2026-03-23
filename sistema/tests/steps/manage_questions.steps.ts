import { loadFeature, defineFeature } from 'jest-cucumber';
import { QuestionBank, Question, Answer } from '../../src/domain/QuestionBank';

const feature = loadFeature('tests/features/manage_questions.feature');

defineFeature(feature, (test) => {
  let bank: QuestionBank;

  test('Add a new multiple choice question', ({ given, when, then, and }) => {
    given('I have a question bank', () => {
      bank = new QuestionBank();
    });

    when(/^I add a question with description "(.*)" and answers:$/, (description: string, table: Answer[]) => {
      const answers = table.map((row: any) => ({
        description: row.description,
        isCorrect: row.isCorrect === 'true',
      }));
      bank.addQuestion({
        id: '1',
        description,
        answers,
      });
    });

    then(/^the question bank should contain (\d+) question$/, (count: string) => {
      expect(bank.getQuestions().length).toBe(parseInt(count, 10));
    });

    and(/^the first question should have the description "(.*)"$/, (description: string) => {
      expect(bank.getQuestions()[0].description).toBe(description);
    });
  });

  test('Modify an existing multiple choice question', ({ given, when, then, and }) => {
    given(/^I have a question bank with a question "(.*)"$/, (description: string) => {
      bank = new QuestionBank();
      bank.addQuestion({
        id: '1',
        description,
        answers: [],
      });
    });

    when(/^I modify the question "(.*)" to have description "(.*)" and answers:$/, (oldDescription: string, newDescription: string, table: Answer[]) => {
      const question = bank.getQuestionByDescription(oldDescription);
      if (question) {
        const answers = table.map((row: any) => ({
          description: row.description,
          isCorrect: row.isCorrect === 'true',
        }));
        bank.modifyQuestion(question.id, newDescription, answers);
      }
    });

    then(/^the question bank should contain (\d+) question$/, (count: string) => {
      expect(bank.getQuestions().length).toBe(parseInt(count, 10));
    });

    and(/^the first question should have the description "(.*)"$/, (description: string) => {
      expect(bank.getQuestions()[0].description).toBe(description);
    });

    and(/^the first question should have (\d+) answers$/, (count: string) => {
      expect(bank.getQuestions()[0].answers.length).toBe(parseInt(count, 10));
    });
  });

  test('Remove an existing multiple choice question', ({ given, when, then }) => {
    given(/^I have a question bank with a question "(.*)"$/, (description: string) => {
      bank = new QuestionBank();
      bank.addQuestion({
        id: '1',
        description,
        answers: [],
      });
    });

    when(/^I remove the question "(.*)"$/, (description: string) => {
      const question = bank.getQuestionByDescription(description);
      if (question) {
        bank.removeQuestion(question.id);
      }
    });

    then(/^the question bank should contain (\d+) questions$/, (count: string) => {
      expect(bank.getQuestions().length).toBe(parseInt(count, 10));
    });
  });
});
