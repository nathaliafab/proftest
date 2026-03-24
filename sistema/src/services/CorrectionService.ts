export class CorrectionService {
	async grade(
		answersCsv: string,
		responsesCsv: string,
		mode: "rigorous" | "proportional",
	): Promise<Record<string, unknown>[]> {
		const answersData = this.parseCsv(answersCsv);
		const responsesData = this.parseCsv(responsesCsv);

		const reports: Record<string, unknown>[] = [];

		const answersMap: Record<string, string[]> = {};
		for (const data of answersData) {
			const headers = data.__headers;
			const values = data.__raw_values;
			const testNoIdx = headers.findIndex(
				(h: string) =>
					h.trim().toLowerCase().includes("number") ||
					h.trim().toLowerCase().includes("prova"),
			);

			if (testNoIdx !== -1) {
				const testNo = values[testNoIdx]?.trim();
				const expectedForTest = values
					.filter((_: unknown, i: number) => i !== testNoIdx)
					.map((v: string) => {
						return (v || "").replace(/^"|"$/g, "").trim().replace(/ /g, "");
					});
				answersMap[testNo] = expectedForTest;
			}
		}

		for (const data of responsesData) {
			const headers = data.__headers;
			const values = data.__raw_values;

			const studentIdx = headers.findIndex(
				(h: string) =>
					h.trim().toLowerCase().includes("aluno") ||
					h.trim().toLowerCase().includes("name") ||
					h.trim().toLowerCase().includes("student"),
			);
			const testNoIdx = headers.findIndex(
				(h: string) =>
					h.trim().toLowerCase().includes("prova") ||
					h.trim().toLowerCase().includes("test"),
			);

			if (studentIdx === -1 || testNoIdx === -1 || !values[studentIdx])
				continue;

			const studentName = values[studentIdx]?.trim();
			const testNo = values[testNoIdx]?.trim();

			const expectedAnswers = answersMap[testNo];

			// Extract answers (everything else besides the student and test number columns)
			const studentAnswers = values
				.filter((_: unknown, i: number) => i !== studentIdx && i !== testNoIdx)
				.map((v: string) =>
					(v || "").replace(/^"|"$/g, "").trim().replace(/ /g, ""),
				);

			// If the row only had one answer column, but it contains commas not wrapped in quotes (e.g. they typed all answers in one column inside quotes like "b,c,e, b, 1,4,8")
			// wait, earlier if they were in multiple columns, they'd be separated by parser.
			// If studentAnswers is length 1 but expectedAnswers > 1, maybe they flattened it:
			if (
				studentAnswers.length === 1 &&
				expectedAnswers &&
				expectedAnswers.length > 1 &&
				studentAnswers[0].length > 1
			) {
				// Maybe they provided one big column containing the answers. If the answers.csv also had multiple, we should attempt fallback, but the instructions provided say the user puts comma separated values and headers like `q1,q2`.
				// Let's just stick to the filter logic which perfectly maps to `Nathalia,1,"b,c,e",b,"1,4,8"`
			}

			if (!expectedAnswers) {
				reports.push({
					aluno: studentName,
					prova: testNo,
					nota_final: 0,
					total_questoes: studentAnswers.length,
					acertos: 0,
					erro: "Gabarito não encontrado para esta prova",
				});
				continue;
			}

			let acertosFull = 0;
			let notaFinal = 0;

			for (let i = 0; i < expectedAnswers.length; i++) {
				const expected = expectedAnswers[i] || "";
				const gave = studentAnswers[i] || "";

				let grade = 0;

				if (mode === "rigorous") {
					if (expected === gave) {
						grade = 1;
						acertosFull++;
					}
				} else {
					if (expected === gave) {
						grade = 1;
						acertosFull++;
					} else if (gave !== "") {
						const expChars = expected.split(",");
						const gaveChars = gave.split(",");
						let hits = 0;
						for (const c of gaveChars) {
							if (expChars.includes(c)) hits++;
						}
						grade = hits / Math.max(expChars.length, 1);
					}
				}

				notaFinal += grade;
			}

			reports.push({
				aluno: studentName,
				prova: testNo,
				nota_final: Number(notaFinal.toFixed(2)),
				acertos: acertosFull,
				total_questoes: expectedAnswers.length,
			});
		}

		return reports;
	}

	private parseCsv(
		text: string,
	): Array<{ __headers: string[]; __raw_values: string[] }> {
		const lines = text.trim().split(/\r?\n/);
		if (lines.length === 0) return [];

		const parseLine = (line: string) => {
			const ret = [];
			let _p = "",
				insideQuotes = false,
				i = 0;
			ret[i] = "";
			for (let l = 0; l < line.length; l++) {
				const ch = line[l];
				if (ch === '"') {
					insideQuotes = !insideQuotes;
				} else if (!insideQuotes && ch === ",") {
					ret[++i] = "";
				} else {
					ret[i] += ch;
				}
			}
			return ret.map((s) => s.trim());
		};

		const headers = parseLine(lines[0]);
		return lines
			.slice(1)
			.map((line) => {
				if (!line.trim()) return null;
				const values = parseLine(line);
				return {
					__headers: headers,
					__raw_values: values,
				};
			})
			.filter(
				(x): x is { __headers: string[]; __raw_values: string[] } => x !== null,
			);
	}
}
