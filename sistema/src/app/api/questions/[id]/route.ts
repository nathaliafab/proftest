import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { Question } from "@/domain/QuestionBank";
import { getDb } from "@/lib/db";
import { questionsTable } from "@/lib/schema";

export async function PUT(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;

		if (!id || typeof id !== "string") {
			return NextResponse.json({ error: "ID inválido" }, { status: 400 });
		}

		const data = await request.json();

		// Type validation
		if (
			!data ||
			typeof data.description !== "string" ||
			!data.description.trim()
		) {
			return NextResponse.json(
				{
					error:
						"A descrição da questão é obrigatória e deve ser um texto válido",
				},
				{ status: 400 },
			);
		}

		if (!Array.isArray(data.answers) || data.answers.length === 0) {
			return NextResponse.json(
				{ error: "A questão deve conter ao menos uma resposta" },
				{ status: 400 },
			);
		}

		// Check if at least one is correct
		if (!data.answers.some((a: { isCorrect: boolean }) => a.isCorrect)) {
			return NextResponse.json(
				{ error: "A questão deve ter pelo menos uma resposta correta" },
				{ status: 400 },
			);
		}

		// Validate answer structure
		for (const answer of data.answers) {
			if (
				typeof answer.description !== "string" ||
				!answer.description.trim() ||
				typeof answer.isCorrect !== "boolean"
			) {
				return NextResponse.json(
					{
						error:
							"As respostas devem ter uma descrição válida e indicar se estão corretas",
					},
					{ status: 400 },
				);
			}
		}

		const db = await getDb();

		await db
			.update(questionsTable)
			.set({
				description: data.description.trim(),
				answers: JSON.stringify(data.answers),
			})
			.where(eq(questionsTable.id, id));

		const [row] = await db
			.select()
			.from(questionsTable)
			.where(eq(questionsTable.id, id));

		if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

		const updatedQuestion: Question = {
			id: row.id,
			description: row.description,
			answers: JSON.parse(row.answers),
		};

		return NextResponse.json(updatedQuestion, { status: 200 });
	} catch (error) {
		console.error("Error updating question:", error);
		return NextResponse.json(
			{ error: "Falha ao atualizar a questão" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: Request,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;
		const db = await getDb();
		await db.delete(questionsTable).where(eq(questionsTable.id, id));
		return new NextResponse(null, { status: 204 });
	} catch (error) {
		console.error("Error deleting question:", error);
		return NextResponse.json(
			{ error: "Falha ao deletar a questão" },
			{ status: 500 },
		);
	}
}
