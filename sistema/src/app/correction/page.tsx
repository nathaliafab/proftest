"use client";

import { Download, UploadCloud, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ExamTest } from "../../domain/Test";
import styles from "./page.module.css";

export default function CorrectionPage() {
	const [tests, setTests] = useState<ExamTest[]>([]);
	const [selectedTestId, setSelectedTestId] = useState<string>("");

	const [answersCsv, setAnswersCsv] = useState<File | null>(null);
	const [responsesCsv, setResponsesCsv] = useState<File | null>(null);

	const [correctionMode, setCorrectionMode] = useState<
		"rigorous" | "proportional"
	>("rigorous");
	const [report, setReport] = useState<Record<string, unknown>[] | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		fetchTests();
	}, []);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDropAnswers = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			setAnswersCsv(e.dataTransfer.files[0]);
		}
	};

	const handleDropResponses = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			setResponsesCsv(e.dataTransfer.files[0]);
		}
	};

	const fetchTests = async () => {
		const res = await fetch("/api/tests");
		const data = await res.json();
		setTests(data);
		if (data.length > 0) {
			setSelectedTestId(data[0].id);
		}
	};

	const handleProcess = async () => {
		if (!selectedTestId) return alert("Selecione uma prova.");
		if (!answersCsv || !responsesCsv)
			return alert("Envie ambos os arquivos CSV.");

		setIsSubmitting(true);
		const formData = new FormData();
		formData.append("testId", selectedTestId);
		formData.append("answers", answersCsv);
		formData.append("responses", responsesCsv);
		formData.append("mode", correctionMode);

		try {
			const res = await fetch("/api/correction", {
				method: "POST",
				body: formData,
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Erro na correção");

			setReport(data.report);
		} catch (error: unknown) {
			alert(error instanceof Error ? error.message : "Erro");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Helper values for the report table
	const avgGrade = report
		? (
				report.reduce((acc, r) => acc + (r.nota_final as number), 0) /
				report.length
			).toFixed(1)
		: "0";
	const successRate = report
		? Math.round(
				(report.filter(
					(r) =>
						(r.acertos as number) >= ((r.total_questoes as number) || 10) * 0.7,
				).length /
					report.length) *
					100,
			)
		: 0;

	return (
		<div className={styles.container}>
			<main className={styles.mainContent}>
				{/* Import Section */}
				<section className={styles.topSection}>
					<div className={styles.importPanel}>
						<div className={styles.panelHeader}>
							<h2 className={styles.panelTitle}>Importação de Dados</h2>
							<span className={styles.badge}>CSV</span>
						</div>

						<div>
							<h3 className={styles.sectionTitle}>PROVA</h3>
							<select
								value={selectedTestId}
								onChange={(e) => setSelectedTestId(e.target.value)}
								className={styles.selectInput}
							>
								<option value="" disabled>
									Selecione uma prova...
								</option>
								{tests.map((t) => (
									<option key={t.id} value={t.id}>
										{t.title}
									</option>
								))}
							</select>
						</div>

						<div className={styles.dropzonesGrid}>
							<div>
								<h3 className={styles.sectionTitle}>
									GABARITO OFICIAL (KEY CSV)
								</h3>
								<div
									className={styles.dropzone}
									onClick={() =>
										document.getElementById("answersUpload")?.click()
									}
									onDragOver={handleDragOver}
									onDrop={handleDropAnswers}
								>
									<UploadCloud size={24} color="#64748B" />
									<div className={styles.dropzoneText}>
										{answersCsv ? (
											<div
												style={{
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													gap: "8px",
												}}
											>
												{answersCsv.name}
												<button
													onClick={(e) => {
														e.stopPropagation();
														setAnswersCsv(null);
														(
															document.getElementById(
																"answersUpload",
															) as HTMLInputElement
														).value = "";
													}}
													style={{
														background: "none",
														border: "none",
														cursor: "pointer",
														display: "flex",
														color: "#EF4444",
													}}
													title="Remover arquivo"
												>
													<X size={18} />
												</button>
											</div>
										) : (
											<>
												Arraste o arquivo ou{" "}
												<span className={styles.dropzoneLink}>clique aqui</span>
											</>
										)}
									</div>
									<div className={styles.dropzoneSubText}>Máximo 5MB</div>
									<input
										id="answersUpload"
										type="file"
										accept=".csv"
										style={{ display: "none" }}
										onChange={(e) => setAnswersCsv(e.target.files?.[0] || null)}
									/>
								</div>
							</div>

							<div>
								<h3 className={styles.sectionTitle}>
									RESPOSTAS DOS ALUNOS (ANSWERS CSV)
								</h3>
								<div
									className={styles.dropzone}
									onClick={() =>
										document.getElementById("responsesUpload")?.click()
									}
									onDragOver={handleDragOver}
									onDrop={handleDropResponses}
								>
									<Users size={24} color="#64748B" />
									<div className={styles.dropzoneText}>
										{responsesCsv ? (
											<div
												style={{
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													gap: "8px",
												}}
											>
												{responsesCsv.name}
												<button
													onClick={(e) => {
														e.stopPropagation();
														setResponsesCsv(null);
														(
															document.getElementById(
																"responsesUpload",
															) as HTMLInputElement
														).value = "";
													}}
													style={{
														background: "none",
														border: "none",
														cursor: "pointer",
														display: "flex",
														color: "#EF4444",
													}}
													title="Remover arquivo"
												>
													<X size={18} />
												</button>
											</div>
										) : (
											<>Upload da base de alunos</>
										)}
									</div>
									<div className={styles.dropzoneSubText}>
										Formato: nome_aluno, tipo_prova, resposta1, resposta2, ...
									</div>
									<input
										id="responsesUpload"
										type="file"
										accept=".csv"
										style={{ display: "none" }}
										onChange={(e) =>
											setResponsesCsv(e.target.files?.[0] || null)
										}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className={styles.rigorPanel}>
						<h2 className={styles.rigorTitle}>Nível de Rigor</h2>

						<div className={styles.rigorOptions}>
							<div
								className={`${styles.rigorOptionBox} ${correctionMode === "rigorous" ? styles.rigorOptionBoxActive : ""}`}
								onClick={() => setCorrectionMode("rigorous")}
							>
								<div className={styles.radioCircle}>
									<div className={styles.radioDot} />
								</div>
								<div className={styles.rigorOptionContent}>
									<div className={styles.rigorOptionTitle}>Alta Rigidez</div>
									<div className={styles.rigorOptionDesc}>
										Critério "Tudo ou Nada". Ideal para provas objetivas de
										múltipla escolha simples.
									</div>
								</div>
							</div>

							<div
								className={`${styles.rigorOptionBox} ${correctionMode === "proportional" ? styles.rigorOptionBoxActive : ""}`}
								onClick={() => setCorrectionMode("proportional")}
							>
								<div className={styles.radioCircle}>
									<div className={styles.radioDot} />
								</div>
								<div className={styles.rigorOptionContent}>
									<div className={styles.rigorOptionTitle}>Proporcional</div>
									<div className={styles.rigorOptionDesc}>
										Pontuação parcial para questões complexas ou somatórias.
									</div>
								</div>
							</div>
						</div>

						<button
							className={styles.btnSubmit}
							onClick={handleProcess}
							disabled={isSubmitting}
						>
							{isSubmitting ? "PROCESSANDO..." : "PROCESSAR CORREÇÃO"}
						</button>
					</div>
				</section>

				{/* Report Section */}
				{report && (
					<section className={styles.reportSection}>
						<div className={styles.reportHeader}>
							<div>
								<h2 className={styles.reportTitle}>Relatório Preliminar</h2>
								<div className={styles.reportSub}>
									Visualização rápida dos últimos processamentos realizados.
								</div>
							</div>
							<button type="button" className={styles.exportBtn}>
								<Download size={16} /> Exportar Tudo
							</button>
						</div>

						<div className={styles.tableContainer}>
							<table className={styles.table}>
								<thead>
									<tr>
										<th>ESTUDANTE</th>
										<th>ACERTOS</th>
										<th>NOTA FINAL</th>
										<th>STATUS</th>
									</tr>
								</thead>
								<tbody>
									{report.map((r, i) => {
										// Extract initials
										const initials = (r.aluno as string)
											.split(" ")
											.map((n: string) => n[0])
											.join("")
											.substring(0, 2)
											.toUpperCase();
										// Define values
										const acertos = r.acertos as number;
										const totalQ = (r.total_questoes as number) || 10;
										const notaFinal = r.nota_final as number;
										const passThreshold = totalQ * 0.7; // 70% of total questions
										const statusVal =
											acertos >= passThreshold ? "APROVADO" : "RECUPERAÇÃO";
										const statusClass =
											acertos >= passThreshold
												? styles.statusPass
												: styles.statusWarning;

										return (
											<tr key={i}>
												<td>
													<div className={styles.studentCell}>
														<div className={styles.avatar}>{initials}</div>
														{r.aluno as string}
													</div>
												</td>
												<td>
													{acertos}/{totalQ}
												</td>
												<td
													className={
														acertos >= passThreshold
															? styles.gradeHigh
															: styles.gradeBorderline
													}
												>
													{notaFinal.toFixed(1)}
												</td>
												<td>
													<span
														className={`${styles.statusBadge} ${statusClass}`}
													>
														{statusVal}
													</span>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>

						<div className={styles.statsFooter}>
							<div className={styles.statsGroup}>
								<div className={styles.statItem}>
									<span className={styles.statLabel}>Total Avaliados</span>
									<span className={styles.statValue}>{report.length}</span>
								</div>
								<div className={styles.statItem}>
									<span className={styles.statLabel}>Média Geral</span>
									<span className={styles.statValue}>{avgGrade}</span>
								</div>
								<div className={styles.statItem}>
									<span className={styles.statLabel}>Taxa de Sucesso</span>
									<span
										className={`${styles.statValue} ${styles.statValueSuccess}`}
									>
										{successRate}%
									</span>
								</div>
							</div>
							<div className={styles.statsActions}>
								<button
									className={styles.btnCancel}
									onClick={() => setReport(null)}
								>
									Cancelar Processo
								</button>
							</div>
						</div>
					</section>
				)}
			</main>
		</div>
	);
}
