import { loadFeature, defineFeature } from 'jest-cucumber';
import { DatabaseTestRepository } from '../../src/repositories/DatabaseTestRepository';
import { DatabaseQuestionBank } from '../../src/repositories/DatabaseQuestionBank';

const feature = loadFeature('tests/features/manage_tests.feature');

defineFeature(feature, (test) => {
  let testRepo: DatabaseTestRepository;
  let questionRepo: DatabaseQuestionBank;

  beforeAll(async () => {
    testRepo = new DatabaseTestRepository();
    questionRepo = new DatabaseQuestionBank();
  });

  beforeEach(async () => {
    await testRepo.clear();
  });

  test('Create a test with letters identifying alternatives', ({ given, when, then, and }) => {
    given(/^there is a question "(.*)" in the database$/, async (description: string) => {
      await questionRepo.addQuestion({
        description,
        answers: [
          { description: 'Mars', isCorrect: true },
          { description: 'Venus', isCorrect: false }
        ]
      });
    });

    when(/^I create a test titled "(.*)" with the question "(.*)" using "(.*)" style$/, async (title: string, desc: string, style: any) => {
      const q = await questionRepo.getQuestionByDescription(desc);
      if (q) {
        await testRepo.addTest(title, [{ questionId: q.id, identifierStyle: style }]);
      }
    });

    then(/^the system should have a test titled "(.*)" with (\d+) question$/, async (title: string, count: string) => {
      const t = await testRepo.getTestByTitle(title);
      expect(t).toBeDefined();
      expect(t?.questions.length).toBe(parseInt(count, 10));
    });

    and(/^the question in the test should be configured to use "(.*)" style$/, async (style: string) => {
      const tests = await testRepo.getTests();
      expect(tests[0].questions[0].identifierStyle).toBe(style);
    });
  });

  test('Modify an existing test', ({ given, and, when, then }) => {
    given(/^there is a question "(.*)" in the database$/, async (description: string) => {
      await questionRepo.addQuestion({
        description,
        answers: [
          { description: 'Mars', isCorrect: true },
          { description: 'Venus', isCorrect: false }
        ]
      });
    });

    and(/^there is a test titled "(.*)" using that question with "(.*)" style$/, async (title: string, style: any) => {
      const q = await questionRepo.getQuestionByDescription("Which planet is known as the Red Planet?");
      if (q) {
        await testRepo.addTest(title, [{ questionId: q.id, identifierStyle: style }]);
      }
    });

    when(/^I modify the test "(.*)" to use the question with "(.*)" style$/, async (title: string, newStyle: any) => {
      const t = await testRepo.getTestByTitle(title);
      const q = await questionRepo.getQuestionByDescription("Which planet is known as the Red Planet?");
      if (t && q) {
        await testRepo.modifyTest(t.id, t.title, [{ questionId: q.id, identifierStyle: newStyle }]);
      }
    });

    then(/^the test "(.*)" should be configured to use "(.*)" style$/, async (title: string, style: string) => {
      const t = await testRepo.getTestByTitle(title);
      expect(t?.questions[0].identifierStyle).toBe(style);
    });
  });

  test('Remove a test', ({ given, when, then }) => {
    given(/^there is a test titled "(.*)"$/, async (title: string) => {
      await testRepo.addTest(title, []);
    });

    when(/^I remove the test "(.*)"$/, async (title: string) => {
      const t = await testRepo.getTestByTitle(title);
      if (t) {
        await testRepo.removeTest(t.id);
      }
    });

    then(/^the system should not have a test titled "(.*)"$/, async (title: string) => {
      const t = await testRepo.getTestByTitle(title);
      expect(t).toBeUndefined();
    });
  });
});
