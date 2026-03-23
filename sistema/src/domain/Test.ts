export type IdentifierStyle = 'letters' | 'powersOf2';

export interface TestQuestionConfig {
  questionId: string;
  identifierStyle: IdentifierStyle;
}

export interface ExamTest {
  id: string;
  title: string;
  questions: TestQuestionConfig[];
}
