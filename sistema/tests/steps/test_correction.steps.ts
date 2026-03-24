import { loadFeature, defineFeature } from 'jest-cucumber';
import { CorrectionService } from '../../src/services/CorrectionService';

const feature = loadFeature('tests/features/test_correction.feature');

defineFeature(feature, (test) => {
  let correctionService: CorrectionService;
  let answersCsv: string;
  let responsesCsv: string;
  let report: any[];

  beforeEach(() => {
    correctionService = new CorrectionService();
  });

  const givenAnswers = (given: any) => {
    given('a CSV with the correct answers formatted as:', (csv: string) => {
      answersCsv = csv;
    });
  };

  const givenResponses = (and: any) => {
    and('a CSV with the student responses formatted as:', (csv: string) => {
      responsesCsv = csv;
    });
  };

  const whenRigorous = (when: any) => {
    when('I select the rigorous correction method that penalizes wrong choices', async () => {
      report = await correctionService.grade(answersCsv, responsesCsv, 'rigorous');
    });
  };

  const whenProportional = (when: any) => {
    when('I select the proportional correction method', async () => {
      report = await correctionService.grade(answersCsv, responsesCsv, 'proportional');
    });
  };

  const thenReportSize = (then: any) => {
    then(/^the report should contain (\d+) students$/, (count: string) => {
      expect(report.length).toBe(parseInt(count, 10));
    });
  };

  const andStudentScore = (and: any) => {
    and(/^the student "(.*)" should have (\d+) correct answer?s? and a final grade of (.*)$/, (name: string, acertos: string, gradeStr: string) => {
      const studentResult = report.find(r => r.aluno === name);
      expect(studentResult).toBeDefined();
      expect(studentResult.acertos).toBe(parseInt(acertos, 10));
      // Grade check
      expect(studentResult.nota_final).toBe(Number(gradeStr));
    });
  };

  test('Rigorous Grading Correction', ({ given, and, when, then }) => {
    givenAnswers(given);
    givenResponses(and);
    whenRigorous(when);
    thenReportSize(then);
    andStudentScore(and);
    andStudentScore(and);
  });

  test('Proportionate Grading Correction', ({ given, and, when, then }) => {
    givenAnswers(given);
    givenResponses(and);
    whenProportional(when);
    thenReportSize(then);
    
    and(/^the student "(.*)" should receive partial credit for question (\d+)$/, (name: string, q: string) => {
      const studentResult = report.find(r => r.aluno === name);
      expect(studentResult).toBeDefined();
      expect(studentResult.nota_final).toBeGreaterThan(0);
      expect(studentResult.nota_final).toBeLessThan(studentResult.total_questoes);
    });

    and(/^the student "(.*)" should have a final grade of (.*)$/, (name: string, gradeStr: string) => {
      const studentResult = report.find(r => r.aluno === name);
      expect(studentResult).toBeDefined();
      expect(studentResult.nota_final).toBe(Number(gradeStr));
    });
    
    and(/^the student "(.*)" should have a final grade of (.*)$/, (name: string, gradeStr: string) => {
      const studentResult = report.find(r => r.aluno === name);
      expect(studentResult).toBeDefined();
      expect(studentResult.nota_final).toBe(Number(gradeStr));
    });
  });

  test('Proportionate Grading with missing answers', ({ given, and, when, then }) => {
    givenAnswers(given);
    givenResponses(and);
    whenProportional(when);
    thenReportSize(then);

    and(/^the student "(.*)" should have a final grade of (.*)$/, (name: string, gradeStr: string) => {
      const studentResult = report.find(r => r.aluno === name);
      expect(studentResult).toBeDefined();
      expect(studentResult.nota_final).toBe(Number(gradeStr));
    });
  });

  test('Missing test key in answers CSV', ({ given, and, when, then }) => {
    givenAnswers(given);
    givenResponses(and);
    whenRigorous(when);
    
    then(/^the report should indicate an error "(.*)" for the student "(.*)"$/, (errorMsg: string, name: string) => {
      const studentResult = report.find(r => r.aluno === name);
      expect(studentResult).toBeDefined();
      expect(studentResult.erro).toBe(errorMsg);
    });

    and(/^the student "(.*)" should have a final grade of (\d+)$/, (name: string, gradeStr: string) => {
      const studentResult = report.find(r => r.aluno === name);
      expect(studentResult.nota_final).toBe(Number(gradeStr));
    });
  });

});
