import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import type { Question } from "../domain/QuestionBank";
import { clearDb, getDb } from "../lib/db";
import { questionsTable } from "../lib/schema";

export class DatabaseQuestionBank {
	async addQuestion(question: Omit<Question, "id">): Promise<Question> {
		const db = await getDb();
		const id = uuidv4();
		const newQuestion: Question = { id, ...question };
		await db.insert(questionsTable).values({
			id: newQuestion.id,
			description: newQuestion.description,
			answers: JSON.stringify(newQuestion.answers),
		});
		return newQuestion;
	}

	async modifyQuestion(
		id: string,
		newDescription: string,
		newAnswers: Record<string, unknown>[],
	): Promise<void> {
		const db = await getDb();
		await db
			.update(questionsTable)
			.set({
				description: newDescription,
				answers: JSON.stringify(newAnswers),
			})
			.where(eq(questionsTable.id, id));
	}

	async removeQuestion(id: string): Promise<void> {
		const db = await getDb();
		await db.delete(questionsTable).where(eq(questionsTable.id, id));
	}

	async getQuestions(): Promise<Question[]> {
		const db = await getDb();
		const rows = await db.select().from(questionsTable);
		return rows.map((r) => ({
			id: r.id,
			description: r.description,
			answers: JSON.parse(r.answers),
		}));
	}

	async getQuestionByDescription(
		description: string,
	): Promise<Question | undefined> {
		const db = await getDb();
		const [row] = await db
			.select()
			.from(questionsTable)
			.where(eq(questionsTable.description, description));
		if (!row) return undefined;
		return {
			id: row.id,
			description: row.description,
			answers: JSON.parse(row.answers),
		};
	}

	async getQuestionById(id: string): Promise<Question | undefined> {
		const db = await getDb();
		const [row] = await db
			.select()
			.from(questionsTable)
			.where(eq(questionsTable.id, id));
		if (!row) return undefined;
		return {
			id: row.id,
			description: row.description,
			answers: JSON.parse(row.answers),
		};
	}

	async clear(): Promise<void> {
		await clearDb();
	}
}
