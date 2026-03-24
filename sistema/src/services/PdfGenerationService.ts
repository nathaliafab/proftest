import AdmZip from "adm-zip";
import PDFDocument from "pdfkit";
import type { Question } from "../domain/QuestionBank";
import type { ExamTest } from "../domain/Test";

export class PdfGenerationService {
	async generateTestZip(
		testData: ExamTest,
		questionsData: Question[],
		amount: number,
		header: { classTitle: string; professorName: string; date: string },
	): Promise<Buffer> {
		const zip = new AdmZip();

		// First, let's form the CSV header. Since we group by question now:
		let csvHeader = "Tipo de Prova";
		if (questionsData.length > 0) {
			for (let i = 1; i <= questionsData.length; i++) {
				csvHeader += `,q${i}`;
			}
		} else {
			csvHeader += ",Answers";
		}
		let csvContent = `${csvHeader}\n`;

		for (let i = 1; i <= amount; i++) {
			// Shuffle questions
			const shuffledQuestions = [...questionsData].sort(
				() => Math.random() - 0.5,
			);

			let testRow = `${i}`;

			const doc = new PDFDocument({
				margin: 50,
				bufferPages: true,
				size: "A4",
			});
			// Set font to a modern sans-serif
			const regularFont = "Helvetica";
			const boldFont = "Helvetica-Bold";

			doc.font(regularFont);

			const buffers: Buffer[] = [];

			doc.on("data", buffers.push.bind(buffers));

			// Let's defer adding the pdf to zip until doc ends
			const docPromise = new Promise<void>((resolve) => {
				doc.on("end", () => {
					const pdfData = Buffer.concat(buffers);
					zip.addFile(`test_${i}.pdf`, pdfData);
					resolve();
				});
			});

			const margins = doc.page.margins;
			const usableWidth = doc.page.width - margins.left - margins.right;

			// Add Header
			const headerTop = doc.y;
			doc
				.font(boldFont)
				.fontSize(16)
				.text("AVALIAÇÃO", margins.left, headerTop);

			let currentY = doc.y + 15;

			// Line separator
			doc
				.moveTo(margins.left, currentY)
				.lineTo(margins.left + usableWidth, currentY)
				.lineWidth(1)
				.stroke();

			currentY += 15;

			const col1X = margins.left;
			const col2X = margins.left + usableWidth / 2;

			// Grid Info Row 1
			doc.font(boldFont).fontSize(8).text("DISCIPLINA: ", col1X, currentY);
			let labelWidth = doc.widthOfString("DISCIPLINA: ");
			doc
				.font(regularFont)
				.text(header.classTitle, col1X + labelWidth, currentY);

			doc.font(boldFont).text("PROFESSOR: ", col2X, currentY);
			labelWidth = doc.widthOfString("PROFESSOR: ");
			doc
				.font(regularFont)
				.text(header.professorName, col2X + labelWidth, currentY);

			currentY += 20;

			// Grid Info Row 2
			doc.font(boldFont).text("DATA: ", col1X, currentY);
			labelWidth = doc.widthOfString("DATA: ");
			doc.font(regularFont).text(header.date, col1X + labelWidth, currentY);

			doc.font(boldFont).text("PROVA Nº: ", col2X, currentY);
			labelWidth = doc.widthOfString("PROVA Nº: ");
			doc
				.font(regularFont)
				.text(i.toString().padStart(2, "0"), col2X + labelWidth, currentY);

			currentY += 20;

			// Bottom Line separator
			doc
				.moveTo(margins.left, currentY)
				.lineTo(margins.left + usableWidth, currentY)
				.lineWidth(1)
				.stroke();

			doc.y = currentY + 20;

			// Add Questions
			shuffledQuestions.forEach((q, qIndex) => {
				const qNum = (qIndex + 1).toString().padStart(2, "0") + ". ";

				// Draw question number and text
				doc
					.font(boldFont)
					.fontSize(11)
					.text(qNum, margins.left, doc.y, { continued: true });
				doc.font(regularFont).text(q.description);
				doc.moveDown(0.5);

				// Shuffle answers
				const shuffledAnswers = [...q.answers].sort(() => Math.random() - 0.5);

				const qConfig = testData.questions.find((c) => c.questionId === q.id);
				const style = qConfig ? qConfig.identifierStyle : "letters";

				const questionAnswers: string[] = [];

				shuffledAnswers.forEach((ans, aIndex) => {
					const letter =
						style === "powersOf2"
							? (2 ** aIndex).toString().padStart(2, "0")
							: String.fromCharCode(65 + aIndex); // 'A' + aIndex

					// Draw circled letter or styled identifier
					doc
						.font(regularFont)
						.fontSize(10)
						.text(`${letter})  ${ans.description}`, margins.left + 25, doc.y);

					if (ans.isCorrect) {
						questionAnswers.push(
							style === "powersOf2"
								? (2 ** aIndex).toString()
								: String.fromCharCode(97 + aIndex),
						); // CSV expects 'a'
					}
				});

				// Push grouped correct answers for this question to the CSV row
				// Enclose in quotes if multiple
				if (questionAnswers.length > 1) {
					testRow += `,"${questionAnswers.join(",")}"`;
				} else if (questionAnswers.length === 1) {
					testRow += `,${questionAnswers[0]}`;
				} else {
					testRow += `,`;
				}

				doc.moveDown(1);

				// Output Response Box
				const boxLabel =
					style === "powersOf2" ? "RESULTADO DA SOMA:" : "RESPOSTA (LETRAS):";
				doc
					.font(boldFont)
					.fontSize(8)
					.text(boxLabel, margins.left + 25, doc.y + 4);
				doc.rect(margins.left + 120, doc.y - 12, 40, 16).stroke();
				doc.moveDown(2);
			});

			// Footer for Tipo de Prova and Student Info
			const pages = doc.bufferedPageRange();
			for (let j = 0; j < pages.count; j++) {
				doc.switchToPage(j);

				const bottomMargin = doc.page.margins.bottom;
				doc.page.margins.bottom = 0;

				// Only draw student info on the first page as per the layout
				if (j === 0) {
					const footerY = doc.page.height - 120;

					doc
						.moveTo(margins.left, footerY)
						.lineTo(margins.left + usableWidth, footerY)
						.lineWidth(1)
						.stroke();

					doc
						.font(boldFont)
						.fontSize(7)
						.text("NOME COMPLETO DO ALUNO", margins.left, footerY + 15);
					doc
						.moveTo(margins.left, footerY + 40)
						.lineTo(margins.left + usableWidth / 2 - 20, footerY + 40)
						.stroke();

					doc.text(
						"CPF / MATRÍCULA",
						margins.left + usableWidth / 2,
						footerY + 15,
					);
					doc
						.moveTo(margins.left + usableWidth / 2, footerY + 40)
						.lineTo(margins.left + usableWidth, footerY + 40)
						.stroke();
				}

				// Draw page info at the very bottom
				const pageLabelY = doc.page.height - 35;
				const shortId = testData.id.split("-")[0].toUpperCase();
				doc.font(boldFont).fontSize(7);
				doc.text(`IDENTIFICADOR: #${shortId}`, margins.left, pageLabelY);
				doc.text(
					`PÁGINA ${j + 1} DE ${pages.count}`,
					margins.left,
					pageLabelY,
					{ align: "right" },
				);

				doc.page.margins.bottom = bottomMargin;
			}

			doc.end();
			await docPromise;

			csvContent += `${testRow}\n`;
		}

		zip.addFile("answers.csv", Buffer.from(csvContent, "utf8"));
		return zip.toBuffer();
	}
}
