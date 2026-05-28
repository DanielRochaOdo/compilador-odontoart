import { useState } from 'react';
import type { FormEvent } from 'react';

interface SuggestionModalProps {
  onClose: () => void;
  onSubmit: (payload: { name: string; sector: string; description: string }) => Promise<void>;
}

export function SuggestionModal({ onClose, onSubmit }: SuggestionModalProps) {
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit({ name, sector, description });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao enviar sugestao.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <form className="modal suggestion-modal glass admin-form" onSubmit={handleSubmit}>
        <h2>Sugestoes</h2>
        <label className="field-label">Nome</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label className="field-label">Setor</label>
        <input value={sector} onChange={(e) => setSector(e.target.value)} required />

        <label className="field-label">Descricao</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button className="ghost-btn" type="button" onClick={onClose} disabled={submitting}>Cancelar</button>
          <button className="primary-btn" type="submit" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar'}</button>
        </div>
      </form>
    </div>
  );
}
