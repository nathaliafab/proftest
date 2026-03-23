"use client";

import { useState, useEffect } from 'react';
import { ExamTest, TestQuestionConfig, IdentifierStyle } from '../../domain/Test';
import { Question } from '../../domain/QuestionBank';

export default function ManageTestsPage() {
  const [tests, setTests] = useState<ExamTest[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfTestId, setPdfTestId] = useState<string>('');
  const [pdfAmount, setPdfAmount] = useState(1);
  const [pdfClassTitle, setPdfClassTitle] = useState('');
  const [pdfProfessorName, setPdfProfessorName] = useState('');
  const [pdfDate, setPdfDate] = useState('');

  const [title, setTitle] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<TestQuestionConfig[]>([]);

  useEffect(() => {
    fetchTests();
    fetchQuestions();
  }, []);

  const fetchTests = async () => {
    const res = await fetch('/api/tests');
    const data = await res.json();
    setTests(data);
  };

  const fetchQuestions = async () => {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(data);
  };

  const handleAddQuestionToTest = (questionId: string) => {
    if (!selectedQuestions.find(q => q.questionId === questionId)) {
      setSelectedQuestions([...selectedQuestions, { questionId, identifierStyle: 'letters' }]);
    }
  };

  const handleRemoveQuestionFromTest = (questionId: string) => {
    setSelectedQuestions(selectedQuestions.filter(q => q.questionId !== questionId));
  };

  const handleStyleChange = (questionId: string, style: IdentifierStyle) => {
    setSelectedQuestions(selectedQuestions.map(q => 
      q.questionId === questionId ? { ...q, identifierStyle: style } : q
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, questions: selectedQuestions };
    
    if (editingId) {
      await fetch(`/api/tests/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setEditingId(null);
    } else {
      await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setTitle('');
    setSelectedQuestions([]);
    fetchTests();
  };

  const handleEdit = (test: ExamTest) => {
    setEditingId(test.id);
    setTitle(test.title);
    setSelectedQuestions([...test.questions]);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/tests/${id}`, { method: 'DELETE' });
    fetchTests();
  };

  const openPdfModal = (testId: string) => {
    setPdfTestId(testId);
    setPdfAmount(1);
    setPdfClassTitle('');
    setPdfProfessorName('');
    setPdfDate('');
    setIsPdfModalOpen(true);
  };

  const closePdfModal = () => {
    setIsPdfModalOpen(false);
    setPdfTestId('');
  };

  const handleGeneratePdf = () => {
    const query = new URLSearchParams({
      amount: pdfAmount.toString(),
      classTitle: pdfClassTitle,
      professorName: pdfProfessorName,
      date: pdfDate
    }).toString();
    
    window.location.href = `/api/tests/${pdfTestId}/generate?${query}`;
    closePdfModal();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setSelectedQuestions([]);
  };

  const getQuestionDetails = (id: string) => questions.find(q => q.id === id);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Manage Tests</h1>
      <p>Create tests from available questions in your bank.</p>

      <section style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>{editingId ? 'Edit Test' : 'Create New Test'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Test Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Available Questions</h3>
              <ul style={{ listStyle: 'none', padding: 0, maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee' }}>
                {questions.map(q => (
                  <li key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontSize: '0.9rem' }}>{q.description}</span>
                    <button type="button" onClick={() => handleAddQuestionToTest(q.id)} disabled={!!selectedQuestions.find(sq => sq.questionId === q.id)} style={{ cursor: 'pointer' }}>
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Selected Questions</h3>
              {selectedQuestions.length === 0 && <p style={{ fontSize: '0.9rem', color: '#666' }}>No questions selected.</p>}
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {selectedQuestions.map(sq => {
                  const qInfo = getQuestionDetails(sq.questionId);
                  return (
                    <li key={sq.questionId} style={{ padding: '0.8rem', background: '#f9f9f9', marginBottom: '0.5rem', borderRadius: '4px' }}>
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{qInfo?.description || 'Unknown Question'}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <select 
                          value={sq.identifierStyle} 
                          onChange={(e) => handleStyleChange(sq.questionId, e.target.value as IdentifierStyle)}
                        >
                          <option value="letters">Letters (a, b, c...)</option>
                          <option value="powersOf2">Powers of 2 (1, 2, 4, 8...)</option>
                        </select>
                        <button type="button" onClick={() => handleRemoveQuestionFromTest(sq.questionId)} style={{ cursor: 'pointer', color: 'red' }}>Remove</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={selectedQuestions.length === 0} style={{ padding: '0.75rem 1.5rem', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {editingId ? 'Save Changes' : 'Create Test'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={{ padding: '0.75rem 1.5rem', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2>Test List ({tests.length})</h2>
        {tests.length === 0 ? (
          <p>No tests created yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tests.map((test) => (
              <li key={test.id} style={{ border: '2px solid #ccc', padding: '1rem', marginBottom: '2rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>{test.title}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openPdfModal(test.id)} style={{ padding: '0.25rem 0.5rem', cursor: 'pointer', background: '#e3f2fd', border: '1px solid #bbdefb', color: '#1976d2' }}>Generate PDFs</button>
                    <button onClick={() => handleEdit(test)} style={{ padding: '0.25rem 0.5rem', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(test.id)} style={{ padding: '0.25rem 0.5rem', cursor: 'pointer', background: '#ffebee', border: '1px solid #ffcdd2', color: 'red' }}>Delete</button>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', borderTop: '1px dashed #ddd', paddingTop: '1rem' }}>
                  <h4 style={{ color: '#555' }}>Preview:</h4>
                  {test.questions.map((tq, index) => {
                    const q = getQuestionDetails(tq.questionId);
                    if (!q) return <p key={index}>Question deleted.</p>;
                    
                    return (
                      <div key={index} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fff', border: '1px solid #eee', borderRadius: '6px' }}>
                        <p style={{ fontWeight: 'bold' }}>{index + 1}. {q.description}</p>
                        <ul style={{ listStyle: 'none', paddingLeft: '1rem' }}>
                          {q.answers.map((ans, i) => {
                            const bullet = tq.identifierStyle === 'letters' ? `${String.fromCharCode(97 + i)})` : `${Math.pow(2, i)})`;
                            return (
                              <li key={i} style={{ marginBottom: '0.25rem' }}>
                                {bullet} {ans.description}
                              </li>
                            );
                          })}
                        </ul>
                        
                        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px dashed #999', background: '#fafafa', display: 'inline-block' }}>
                          {tq.identifierStyle === 'letters' ? (
                            <strong>Selected Letters: [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]</strong>
                          ) : (
                            <strong>Sum of alternatives: [ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ]</strong>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isPdfModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Generate PDFs</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Number of PDFs (unique variations):</label><br />
              <input type="number" min="1" value={pdfAmount} onChange={(e) => setPdfAmount(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>Class Title:</label><br />
              <input type="text" value={pdfClassTitle} onChange={(e) => setPdfClassTitle(e.target.value)} placeholder="e.g. Introduction to Programming" style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Professor Name:</label><br />
              <input type="text" value={pdfProfessorName} onChange={(e) => setPdfProfessorName(e.target.value)} placeholder="e.g. Prof. Alan Turing" style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Date:</label><br />
              <input type="date" value={pdfDate} onChange={(e) => setPdfDate(e.target.value)} style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={closePdfModal} style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: '#e0e0e0', border: 'none', borderRadius: '4px' }}>Cancel</button>
              <button onClick={handleGeneratePdf} style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px' }}>Download Zip</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
