import { NextResponse } from "next/server";
import type { Question } from "../../../../../domain/QuestionBank";
import { DatabaseQuestionBank } from "../../../../../repositories/DatabaseQuestionBank";
import { DatabaseTestRepository } from "../../../../../repositories/DatabaseTestRepository";
import { PdfGenerationService } from "../../../../../services/PdfGenerationService";

export async function GET(
	request: Request,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;
		if (!id || typeof id !== "string") {
			return NextResponse.json({ error: "ID inválido" }, { status: 400 });
		}

		const url = new URL(request.url);

		const amountStr = url.searchParams.get("amount") || "1";
		const amount = parseInt(amountStr, 10);

		// Validation
		if (Number.isNaN(amount) || amount < 1 || amount > 100) {
			return NextResponse.json(
				{ error: "A quantidade deve ser um número entre 1 e 100" },
				{ status: 400 },
			);
		}

		const classTitle = url.searchParams.get("classTitle") || "Class Title";
		const professorName =
			url.searchParams.get("professorName") || "Professor Name";
		const date =
			url.searchParams.get("date") || new Date().toISOString().split("T")[0];

		const testRepo = new DatabaseTestRepository();
		const questionRepo = new DatabaseQuestionBank();

		const tests = await testRepo.getTests();
		const testInstance = tests.find((t) => t.id === id);

		if (!testInstance) {
			return NextResponse.json(
				{ error: "Prova não encontrada" },
				{ status: 404 },
			);
		}

		const questionsData = await Promise.all(
			testInstance.questions.map((qConf) =>
				questionRepo.getQuestionById(qConf.questionId),
			),
		);

		const validQuestions = questionsData.filter(
			(q) => q !== undefined,
		) as Question[];

		if (validQuestions.length === 0) {
			return NextResponse.json(
				{ error: "Não há questões válidas associadas a esta prova" },
				{ status: 400 },
			);
		}

		const pdfService = new PdfGenerationService();
		const buffer = await pdfService.generateTestZip(
			testInstance,
			validQuestions,
			amount,
			{ classTitle, professorName, date },
		);

		return new NextResponse(buffer as unknown as BodyInit, {
			status: 200,
			headers: {
				"Content-Type": "application/zip",
				"Content-Disposition": `attachment; filename="tests_${id}.zip"`,
			},
		});
	} catch (error) {
		console.error("Error generating PDF tests:", error);
		return NextResponse.json(
			{ error: "Falha ao gerar as provas" },
			{ status: 500 },
		);
	}
}
