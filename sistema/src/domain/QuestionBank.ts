export interface Answer {
	description: string;
	isCorrect: boolean;
}

export interface Question {
	id: string;
	description: string;
	answers: Answer[];
}
