"use client";

import { FileText, ListTodo } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
	return (
		<div className={styles.mainContainer}>
			<div className={styles.pageWrapper}>
				<header className={styles.header}>
					<h1 className={styles.headerTitle}>Bem-vindo ao ProfTest</h1>
					<p className={styles.headerSub}>
						Selecione uma opção abaixo para gerenciar seus recursos.
					</p>
				</header>

				<div className={styles.cardsGrid}>
					<Link href="/questions" className={styles.card}>
						<div className={styles.cardIcon}>
							<ListTodo size={40} />
						</div>
						<h2 className={styles.cardTitle}>Gerenciamento de Questões</h2>
						<p className={styles.cardDesc}>
							Crie, edite e organize questões de múltipla escolha com opções
							customizáveis.
						</p>
					</Link>

					<Link href="/tests" className={styles.card}>
						<div className={styles.cardIcon}>
							<FileText size={40} />
						</div>
						<h2 className={styles.cardTitle}>Gerenciamento de Provas</h2>
						<p className={styles.cardDesc}>
							Monte exames baseados no seu banco de questões e gere PDFs
							exportáveis.
						</p>
					</Link>
				</div>
			</div>
		</div>
	);
}
