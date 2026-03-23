export interface Answer {
  description: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  description: string;
  answers: Answer[];
}

export class QuestionBank {
  private questions: Question[] = [];

  public addQuestion(question: Question): void {
    this.questions.push(question);
  }

  public modifyQuestion(id: string, newDescription: string, newAnswers: Answer[]): void {
    const question = this.questions.find((q) => q.id === id);
    if (question) {
      question.description = newDescription;
      question.answers = newAnswers;
    }
  }

  public removeQuestion(id: string): void {
    this.questions = this.questions.filter((q) => q.id !== id);
  }

  public getQuestions(): Question[] {
    return this.questions;
  }

  public getQuestionByDescription(description: string): Question | undefined {
    return this.questions.find((q) => q.description === description);
  }
}
