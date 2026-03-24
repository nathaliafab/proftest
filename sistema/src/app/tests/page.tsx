"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Question } from '../../domain/QuestionBank';
import { ExamTest, TestQuestionConfig, IdentifierStyle } from '../../domain/Test';
import { Eye, LayoutGrid, List, Pencil, Trash2, Download, Printer } from 'lucide-react';

export default function ManageTestsPage() {
  const [tests, setTests] = useState<ExamTest[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<TestQuestionConfig[]>([]);

  // Pdf Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfTestId, setPdfTestId] = useState<string | null>(null);
  const [pdfAmount, setPdfAmount] = useState<number>(1);
  const [pdfClassTitle, setPdfClassTitle] = useState('');
  const [pdfProfessorName, setPdfProfessorName] = useState('');
  const [pdfDate, setPdfDate] = useState('');

  useEffect(() => {
    fetchTests();
    fetchQuestions();
  }, []);

  const fetchTests = async () => {
    try {
      const res = await fetch('/api/tests');
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Failed to fetch tests');
      setTests(data);
    } catch(err: any) {
      alert(err.message);
    }
  };

  const fetchQuestions = async () => {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(data);
  };

  const handleToggleQuestion = (id: string, style: IdentifierStyle = 'letters') => {
    const exists = selectedQuestions.find(q => q.questionId === id);
    if (exists) {
      setSelectedQuestions(selectedQuestions.filter(q => q.questionId !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, { questionId: id, identifierStyle: style }]);
    }
  };

  const handleChangeQuestionStyle = (id: string, style: IdentifierStyle) => {
    setSelectedQuestions(selectedQuestions.map(q => q.questionId === id ? { ...q, identifierStyle: style } : q));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if(!title) { alert('O título é obrigatório'); return; }
    
    // Validate we have at least one question mapped
    if (selectedQuestions.length === 0) {
      alert('A prova deve ter pelo menos uma questão selecionada');
      return;
    }

    const payload = { title, questions: selectedQuestions };
    
    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/tests/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Erro ao salvar a prova');
      setEditingId(null);
      setTitle('');
      setSelectedQuestions([]);
      fetchTests();
    } catch(err: any) {
       alert(err.message);
    }
  };

  const handleEdit = (t: ExamTest) => {
    setEditingId(t.id);
    setTitle(t.title);
    setSelectedQuestions(t.questions.map(q => ({ ...q })));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/tests/${id}`, { method: 'DELETE' });
      if (!res.ok) {
         const data = await res.json().catch(() => ({}));
         throw new Error(data.error || 'Erro ao deletar a prova');
      }
      fetchTests();
    } catch(err: any) {
       alert(err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setSelectedQuestions([]);
  };

  const openPdfModal = (testId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPdfTestId(testId);
    setIsPdfModalOpen(true);
  };

  const closePdfModal = () => {
    setIsPdfModalOpen(false);
    setPdfTestId(null);
    setPdfAmount(1);
    setPdfClassTitle('');
    setPdfProfessorName('');
    setPdfDate('');
  };

  const handleGeneratePdf = () => {
    if (!pdfTestId) return;
    
    const params = new URLSearchParams({
      amount: pdfAmount.toString(),
      classTitle: pdfClassTitle,
      professorName: pdfProfessorName,
      date: pdfDate
    });
    
    window.location.href = `/api/tests/${pdfTestId}/generate?${params.toString()}`;
    closePdfModal();
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h2 className={styles.headerTitle}>Gerenciamento de Provas</h2>
          <button className={styles.btnPrimary} onClick={handleCancelEdit}>Nova Prova</button>
        </header>

        <section className={styles.formSection}>
          <div className={styles.leftColumn}>
            <div className={styles.sectionTitle}>TÍTULO DA PROVA</div>
            <textarea
              className={styles.textarea}
              placeholder="Digite aqui o título da avaliação..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ minHeight: '60px' }}
            />

            <div className={styles.altsHeader}>
              <div className={styles.sectionTitle}>SELECIONAR QUESTÕES ({selectedQuestions.length} inclusas)</div>
              <span className={styles.altsHint}>Selecione as questões para a prova no checkbox lateral</span>
            </div>

            <div className={styles.alternativesList} style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {questions.length === 0 ? (
                <p style={{color: '#A0AEC0', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '1rem'}}>Nenhuma questão no banco.</p>
              ) : questions.map(q => {
                const selected = selectedQuestions.find(sq => sq.questionId === q.id);
                const isSelected = !!selected;

                return (
                  <div key={q.id} className={`${styles.alternativeBox} ${isSelected ? styles.alternativeBoxActive : ''}`}>
                    <div className={styles.checkboxContainer}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleToggleQuestion(q.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0B132B' }}
                      />
                    </div>
                    <div className={styles.altContent} style={{ cursor: 'pointer' }} onClick={() => handleToggleQuestion(q.id)}>
                      <div className={styles.altDesc}>{q.description}</div>
                      
                      {isSelected && (
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={(e)=>e.stopPropagation()}>
                          <label style={{fontSize: '0.75rem', fontWeight: 700, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.05em'}}>ESTILO DA RESPOSTA:</label>
                          <select 
                            value={selected.identifierStyle} 
                            onChange={(e) => handleChangeQuestionStyle(q.id, e.target.value as IdentifierStyle)}
                            style={{
                              padding: '0.4rem', 
                              borderRadius: '4px', 
                              border: '1px solid #E2E8F0', 
                              outline: 'none', 
                              background: '#E2E8F0',
                              color: '#333',
                              fontFamily: 'inherit',
                              fontSize: '0.85rem'
                            }}
                          >
                            <option value="letters">Letras (a, b, c...)</option>
                            <option value="powersOf2">Soma (1, 2, 4, 8...)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className={styles.actions}>
              {editingId && <button className={styles.btnCancel} onClick={handleCancelEdit}>Cancelar Edição</button>}
              <button className={styles.btnPrimary} onClick={() => handleSubmit()}>{editingId ? 'Salvar Alterações' : 'Salvar Nova Prova'}</button>
            </div>
          </div>
        </section>

        <section className={styles.bankSection}>
          <div className={styles.bankHeader}>
            <div>
              <h2 className={styles.bankTitle}>Banco de Provas</h2>
              <p className={styles.bankSub}>Provas recentemente editadas no projeto</p>
            </div>
            <div className={styles.viewToggles}>
              <button 
                className={`${styles.viewToggleBtn} ${viewMode === 'grid' ? styles.viewToggleBtnActive : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                className={`${styles.viewToggleBtn} ${viewMode === 'list' ? styles.viewToggleBtnActive : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? styles.cardsGrid : styles.cardsList}>
            {tests.map((t) => (
              <div key={t.id} className={styles.card} onClick={() => handleEdit(t)}>
                <div className={styles.cardId}>ID #{t.id.split('-')[0]}</div>
                <div className={styles.cardDesc}>{t.title}</div>
                <div className={styles.cardFooter}>
                  <span className={styles.cardDate}>{t.questions.length} Questões</span>
                  <div className={styles.cardActions}>
                    <button className={styles.iconBtn} onClick={(e) => openPdfModal(t.id, e)} title="Gerar PDFs">
                      <Printer size={16} />
                    </button>
                    <button className={styles.iconBtn} onClick={(e) => { e.stopPropagation(); handleEdit(t); }} title="Editar Prova">
                      <Pencil size={16} />
                    </button>
                    <button className={styles.iconBtn} onClick={(e) => handleDelete(t.id, e)} title="Excluir">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {tests.length === 0 && (
             <p style={{color: '#A0AEC0', padding: '2rem 0', textAlign: 'center'}}>Nenhuma prova adicionada ainda.</p>
          )}
        </section>

        {/* PDF Generation Modal */}
        {isPdfModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3 className={styles.modalTitle}>Gerar Documentos (PDF)</h3>
              
              <div className={styles.modalInputGroup}>
                <label className={styles.modalLabel}>Qtd. de Provas (Variações):</label>
                <input 
                  type="number" 
                  min="1" 
                  className={styles.modalInput}
                  value={pdfAmount} 
                  onChange={e => setPdfAmount(parseInt(e.target.value) || 1)} 
                />
              </div>
              
              <div className={styles.modalInputGroup}>
                <label className={styles.modalLabel}>Título da Disciplina:</label>
                <input 
                  type="text" 
                  className={styles.modalInput}
                  value={pdfClassTitle} 
                  onChange={e => setPdfClassTitle(e.target.value)} 
                  placeholder="Ex: Introdução à Programação"
                />
              </div>

              <div className={styles.modalInputGroup}>
                <label className={styles.modalLabel}>Nome do Professor:</label>
                <input 
                  type="text" 
                  className={styles.modalInput}
                  value={pdfProfessorName} 
                  onChange={e => setPdfProfessorName(e.target.value)} 
                  placeholder="Ex: Prof. Alan Turing"
                />
              </div>

              <div className={styles.modalInputGroup}>
                <label className={styles.modalLabel}>Data da Aplicação:</label>
                <input 
                  type="date" 
                  className={styles.modalInput}
                  value={pdfDate} 
                  onChange={e => setPdfDate(e.target.value)} 
                />
              </div>

              <div className={styles.actions} style={{ marginTop: '2rem' }}>
                <button className={styles.btnCancel} onClick={closePdfModal}>Cancelar</button>
                <button className={styles.btnPrimary} onClick={handleGeneratePdf} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Download size={16} color="#fff" /> Baixar (.zip)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
