"use client";

import { LayoutGrid, List, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Answer, Question } from "../../domain/QuestionBank";
import styles from "./page.module.css";

export default function ManageQuestionsPage() {
	const [questions, setQuestions] = useState<Question[]>([]);

	// Form State
	const [editingId, setEditingId] = useState<string | null>(null);
	const [description, setDescription] = useState("");
	const [answers, setAnswers] = useState<Answer[]>([
		{ description: "", isCorrect: false },
	]);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	useEffect(() => {
		fetchQuestions();
	}, []);

	const fetchQuestions = async () => {
		try {
			const res = await fetch("/api/questions");
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Failed to fetch questions");
			}
			setQuestions(data);
		} catch (err: unknown) {
			alert(err instanceof Error ? err.message : String(err));
		}
	};

	const handleAddAnswer = () => {
		setAnswers([...answers, { description: "", isCorrect: false }]);
	};

	const handleAnswerChange = (
		index: number,
		field: keyof Answer,
		value: string | boolean,
	) => {
		const newAnswers = [...answers];
		newAnswers[index] = { ...newAnswers[index], [field]: value };
		setAnswers(newAnswers);
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (!description) {
			alert("A descrição é obrigatória");
			return;
		}

		const validAnswers = answers.filter((a) => a.description.trim() !== "");
		if (validAnswers.length === 0) {
			alert("A questão deve ter pelo menos uma alternativa.");
			return;
		}

		if (!validAnswers.some((a) => a.isCorrect)) {
			alert("A questão deve ter pelo menos uma resposta correta.");
			return;
		}

		const payload = { description, answers: validAnswers };

		try {
			let res: Response | undefined;
			if (editingId) {
				res = await fetch(`/api/questions/${editingId}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
			} else {
				res = await fetch("/api/questions", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
			}

			const resData = await res.json();
			if (!res.ok) {
				throw new Error(resData.error || "Erro ao salvar questão");
			}

			if (editingId) setEditingId(null);
		} catch (err: unknown) {
			alert(err instanceof Error ? err.message : String(err));
			return;
		}
		setDescription("");
		setAnswers([{ description: "", isCorrect: false }]);
		fetchQuestions();
	};

	const handleEdit = (q: Question) => {
		setEditingId(q.id);
		setDescription(q.description);
		setAnswers(q.answers.map((a) => ({ ...a })));
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleDelete = async (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || "Erro ao deletar questão");
			}
			fetchQuestions();
		} catch (err: unknown) {
			alert(err instanceof Error ? err.message : String(err));
		}
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setDescription("");
		setAnswers([{ description: "", isCorrect: false }]);
	};

	return (
		<div className={styles.container}>
			<main className={styles.mainContent}>
				<header className={styles.header}>
					<h2 className={styles.headerTitle}>Gerenciamento de Questões</h2>
					<button
						type="button"
						className={styles.btnPrimary}
						onClick={handleCancelEdit}
					>
						Nova Questão
					</button>
				</header>

				<section className={styles.formSection}>
					<div className={styles.leftColumn}>
						<div className={styles.sectionTitle}>ENUNCIADO DA QUESTÃO</div>
						<textarea
							className={styles.textarea}
							placeholder="Digite aqui o texto base da sua questão..."
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>

						<div className={styles.altsHeader}>
							<div className={styles.sectionTitle}>ALTERNATIVAS</div>
							<span className={styles.altsHint}>
								Marque a correta no checkbox lateral
							</span>
						</div>

						<div className={styles.alternativesList}>
							{answers.map((answer, index) => {
								const isSelected = answer.isCorrect;
								return (
									<div
										key={index}
										className={`${styles.alternativeBox} ${isSelected ? styles.alternativeBoxActive : ""}`}
									>
										<div className={styles.checkboxContainer}>
											<input
												type="checkbox"
												checked={isSelected}
												onChange={(e) =>
													handleAnswerChange(
														index,
														"isCorrect",
														e.target.checked,
													)
												}
												style={{
													width: "18px",
													height: "18px",
													cursor: "pointer",
													accentColor: "#0B132B",
												}}
											/>
										</div>
										<div className={styles.altContent}>
											<div className={styles.altLetter}>
												{String.fromCharCode(65 + index)}
											</div>
											<input
												type="text"
												className={styles.altInput}
												placeholder={`Descreva a ${["primeira", "segunda", "terceira", "quarta", "quinta"][index] || `${index + 1}ª`} alternativa...`}
												value={answer.description}
												onChange={(e) =>
													handleAnswerChange(
														index,
														"description",
														e.target.value,
													)
												}
											/>
										</div>
									</div>
								);
							})}
						</div>

						<button
							type="button"
							className={styles.addAltBtn}
							onClick={handleAddAnswer}
						>
							<Plus size={16} /> Adicionar Alternativa
						</button>

						<div className={styles.actions}>
							<button
								type="button"
								className={styles.btnCancel}
								onClick={handleCancelEdit}
							>
								Cancelar
							</button>
							<button
								type="button"
								className={styles.btnPrimary}
								onClick={() => handleSubmit()}
							>
								Salvar Alterações
							</button>
						</div>
					</div>
				</section>

				<section className={styles.bankSection}>
					<div className={styles.bankHeader}>
						<div>
							<h2 className={styles.bankTitle}>Banco de Questões</h2>
							<p className={styles.bankSub}>
								Questões recentemente editadas no projeto
							</p>
						</div>
						<div className={styles.viewToggles}>
							<button
								type="button"
								className={`${styles.viewToggleBtn} ${viewMode === "grid" ? styles.viewToggleBtnActive : ""}`}
								onClick={() => setViewMode("grid")}
							>
								<LayoutGrid size={18} />
							</button>
							<button
								type="button"
								className={`${styles.viewToggleBtn} ${viewMode === "list" ? styles.viewToggleBtnActive : ""}`}
								onClick={() => setViewMode("list")}
							>
								<List size={18} />
							</button>
						</div>
					</div>

					<div
						className={
							viewMode === "grid" ? styles.cardsGrid : styles.cardsList
						}
					>
						{questions.map((q) => (
							<div
								key={q.id}
								className={styles.card}
								role="button"
								tabIndex={0}
								onClick={() => handleEdit(q)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleEdit(q);
									}
								}}
							>
								<div className={styles.cardId}>ID #{q.id.split("-")[0]}</div>
								<div className={styles.cardDesc}>{q.description}</div>
								<div className={styles.cardFooter}>
									<span className={styles.cardDate}>
										Atualizado recentemente
									</span>
									<div className={styles.cardActions}>
										<button
											type="button"
											className={styles.iconBtn}
											onClick={(e) => {
												e.stopPropagation();
												handleEdit(q);
											}}
										>
											<Pencil size={16} />
										</button>
										<button
											type="button"
											className={styles.iconBtn}
											onClick={(e) => handleDelete(q.id, e)}
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>

					{questions.length === 0 && (
						<p style={{ color: "#A0AEC0", padding: "2rem 0" }}>
							Nenhuma questão adicionada ainda.
						</p>
					)}
				</section>
			</main>
		</div>
	);
}
