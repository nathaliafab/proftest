"use client";

import { useState, useEffect } from 'react';
import { Question, Answer } from '../../domain/QuestionBank';

export default function ManageQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([{ description: '', isCorrect: false }]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const res = await fetch('/api/questions');
    const data = await res.json();
    setQuestions(data);
  };

  const handleAddAnswer = () => {
    setAnswers([...answers, { description: '', isCorrect: false }]);
  };

  const handleRemoveAnswer = (index: number) => {
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const handleAnswerChange = (index: number, field: keyof Answer, value: any) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { description, answers };
    
    if (editingId) {
      await fetch(`/api/questions/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setEditingId(null);
    } else {
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setDescription('');
    setAnswers([{ description: '', isCorrect: false }]);
    fetchQuestions();
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setDescription(q.description);
    setAnswers(q.answers.map(a => ({ ...a })));
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    fetchQuestions();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDescription('');
    setAnswers([{ description: '', isCorrect: false }]);
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Manage Multiple Choice Questions</h1>
      <p>Add, edit, or remove questions for your tests.</p>

      <section style={{ border: '1px solid #ccc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h2>{editingId ? 'Edit Question' : 'Add New Question'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Question Description:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <div>
            <h3 style={{ marginBottom: '0.5rem' }}>Answers:</h3>
            {answers.map((answer, index) => (
              <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Answer description"
                  value={answer.description}
                  onChange={(e) => handleAnswerChange(index, 'description', e.target.value)}
                  required
                  style={{ flex: 1, padding: '0.5rem' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={answer.isCorrect}
                    onChange={(e) => handleAnswerChange(index, 'isCorrect', e.target.checked)}
                  />
                  Is Correct
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveAnswer(index)}
                  disabled={answers.length <= 1}
                  style={{ padding: '0.5rem', background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddAnswer}
              style={{ padding: '0.5rem', marginTop: '0.5rem', background: '#e3f2fd', border: '1px solid #bbdefb', borderRadius: '4px', cursor: 'pointer' }}
            >
              + Add Answer
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {editingId ? 'Save Changes' : 'Add Question'}
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
        <h2>Question Bank ({questions.length})</h2>
        {questions.length === 0 ? (
          <p>No questions added yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {questions.map((q) => (
              <li key={q.id} style={{ border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3>{q.description}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleEdit(q)} style={{ padding: '0.25rem 0.5rem', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(q.id)} style={{ padding: '0.25rem 0.5rem', cursor: 'pointer', background: '#ffebee', border: '1px solid #ffcdd2' }}>Delete</button>
                  </div>
                </div>
                <ul>
                  {q.answers.map((a, i) => (
                    <li key={i} style={{ color: a.isCorrect ? 'green' : 'inherit', fontWeight: a.isCorrect ? 'bold' : 'normal' }}>
                      {a.description} {a.isCorrect && '(Correct)'}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
