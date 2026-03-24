import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import type { ExamTest } from "@/domain/Test";
import { getDb } from "@/lib/db";
import { testsTable } from "@/lib/schema";

export async function GET() {
	try {
		const db = await getDb();
		const rows = await db.select().from(testsTable);
		const tests: ExamTest[] = rows.map((row) => ({
			id: row.id,
			title: row.title,
			questions: JSON.parse(row.questions),
		}));
		return NextResponse.json(tests, { status: 200 });
	} catch (error) {
		console.error("Error fetching tests:", error);
		return NextResponse.json(
			{ error: "Falha ao buscar as provas" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request) {
	try {
		const data = await request.json();

		// Validation
		if (!data || typeof data.title !== "string" || !data.title.trim()) {
			return NextResponse.json(
				{ error: "O título da prova é obrigatório e deve ser um texto" },
				{ status: 400 },
			);
		}
		if (!Array.isArray(data.questions)) {
			return NextResponse.json(
				{ error: "A lista de questões é inválida" },
				{ status: 400 },
			);
		}

		const db = await getDb();
		const newTest: ExamTest = {
			id: uuidv4(),
			title: data.title.trim(),
			questions: data.questions,
		};

		await db.insert(testsTable).values({
			id: newTest.id,
			title: newTest.title,
			questions: JSON.stringify(newTest.questions),
		});

		return NextResponse.json(newTest, { status: 201 });
	} catch (error) {
		console.error("Error saving test:", error);
		return NextResponse.json(
			{ error: "Falha ao salvar a prova" },
			{ status: 500 },
		);
	}
}
