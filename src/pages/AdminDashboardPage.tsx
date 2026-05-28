import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Eye, Trash2 } from 'lucide-react';
import { DynamicIcon, iconNames } from 'lucide-react/dynamic';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { Announcement, CatalogLink, UserSuggestion } from '../types';

const INITIAL_LINK: Partial<CatalogLink> = {
  title: '',
  description: '',
  url: '',
  image_url: '',
  icon_name: null,
  category: '',
  is_active: true,
  is_public: true,
  is_featured: false,
};

const INITIAL_ANNOUNCEMENT: Partial<Announcement> = {
  title: '',
  message: '',
  is_active: true,
  start_at: null,
  end_at: null,
};

function toInputDate(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60000);
  return adjusted.toISOString().slice(0, 16);
}

function fromInputDate(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function AdminDashboardPage() {
  const SUGGESTIONS_PER_PAGE = 3;
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [links, setLinks] = useState<CatalogLink[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [suggestionsPage, setSuggestionsPage] = useState(1);
  const [selectedSuggestion, setSelectedSuggestion] = useState<UserSuggestion | null>(null);
  const [editing, setEditing] = useState<Partial<CatalogLink>>(INITIAL_LINK);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement>>(INITIAL_ANNOUNCEMENT);
  const [iconQuery, setIconQuery] = useState('');

  const filteredIcons = useMemo(() => {
    const q = iconQuery.trim().toLowerCase();
    if (!q) return iconNames.slice(0, 20);
    return iconNames.filter((name) => name.toLowerCase().includes(q)).slice(0, 20);
  }, [iconQuery]);

  const totalSuggestionPages = Math.max(1, Math.ceil(suggestions.length / SUGGESTIONS_PER_PAGE));
  const pagedSuggestions = suggestions.slice(
    (suggestionsPage - 1) * SUGGESTIONS_PER_PAGE,
    suggestionsPage * SUGGESTIONS_PER_PAGE,
  );

  const loadData = async () => {
    const [{ data: linkRows }, { data: announcementRows }, { data: suggestionRows }] = await Promise.all([
      supabase.from('catalog_links').select('*').order('title', { ascending: true }).order('created_at', { ascending: true }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('user_suggestions').select('*').order('created_at', { ascending: false }),
    ]);

    setLinks((linkRows ?? []) as CatalogLink[]);
    setAnnouncements((announcementRows ?? []) as Announcement[]);
    setSuggestions((suggestionRows ?? []) as UserSuggestion[]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveLink = async (event: FormEvent) => {
    event.preventDefault();
    if (!editing.title || !editing.url || !editing.description) return;

    if (editing.id) {
      await supabase.from('catalog_links').update(editing).eq('id', editing.id);
    } else {
      await supabase.from('catalog_links').insert(editing);
    }

    setEditing(INITIAL_LINK);
    setIconQuery('');
    loadData();
  };

  const deleteLink = async (id: string) => {
    await supabase.from('catalog_links').delete().eq('id', id);
    loadData();
  };

  const saveAnnouncement = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingAnnouncement.title || !editingAnnouncement.message) return;

    const payload = {
      title: editingAnnouncement.title,
      message: editingAnnouncement.message,
      is_active: editingAnnouncement.is_active ?? true,
      start_at: editingAnnouncement.start_at ?? null,
      end_at: editingAnnouncement.end_at ?? null,
      frequency_type: 'always',
      frequency_hours: null,
    };

    if (editingAnnouncement.id) {
      await supabase.from('announcements').update(payload).eq('id', editingAnnouncement.id);
    } else {
      await supabase.from('announcements').insert(payload);
    }

    setEditingAnnouncement(INITIAL_ANNOUNCEMENT);
    loadData();
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    loadData();
  };

  const deleteSuggestion = async (id: string) => {
    await supabase.from('user_suggestions').delete().eq('id', id);
    const nextCount = suggestions.length - 1;
    const nextTotalPages = Math.max(1, Math.ceil(nextCount / SUGGESTIONS_PER_PAGE));
    if (suggestionsPage > nextTotalPages) setSuggestionsPage(nextTotalPages);
    loadData();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <div className="page-shell">
        <header className="header glass">
          <div>
            <h1>Painel Administrativo</h1>
            <p>CRUD de sistemas e avisos do portal.</p>
          </div>
          <button className="ghost-btn" type="button" onClick={handleLogout}>
            Sair
          </button>
        </header>

        <section className="admin-layout">
          <form className="glass panel admin-form" onSubmit={saveLink}>
            <h2>{editing.id ? 'Editar sistema' : 'Novo sistema'}</h2>

            <label className="field-label">Nome</label>
            <input value={editing.title || ''} onChange={(e) => setEditing((prev) => ({ ...prev, title: e.target.value }))} required />

            <label className="field-label">Descrição</label>
            <textarea value={editing.description || ''} onChange={(e) => setEditing((prev) => ({ ...prev, description: e.target.value }))} required />

            <label className="field-label">URL</label>
            <input value={editing.url || ''} onChange={(e) => setEditing((prev) => ({ ...prev, url: e.target.value }))} required />

            <label className="field-label">Imagem (URL)</label>
            <input value={editing.image_url || ''} onChange={(e) => setEditing((prev) => ({ ...prev, image_url: e.target.value }))} />

            <label className="field-label">Buscar icone Lucide</label>
            <input
              placeholder="Ex.: shield, building, users"
              value={iconQuery}
              onChange={(e) => setIconQuery(e.target.value)}
            />

            <div className="icon-picker-grid">
              {filteredIcons.map((name) => (
                <button
                  key={name}
                  type="button"
                  className={`icon-chip ${editing.icon_name === name ? 'selected' : ''}`}
                  onClick={() => setEditing((prev) => ({ ...prev, icon_name: name }))}
                  title={name}
                >
                  <DynamicIcon name={name} size={16} />
                  <span>{name}</span>
                </button>
              ))}
            </div>

            {editing.icon_name && (
              <div className="selected-icon-preview">
                <DynamicIcon name={editing.icon_name as never} size={18} />
                <span>Selecionado: {editing.icon_name}</span>
                <button type="button" className="ghost-btn" onClick={() => setEditing((prev) => ({ ...prev, icon_name: null }))}>Remover</button>
              </div>
            )}

            <label className="field-label">Categoria</label>
            <input value={editing.category || ''} onChange={(e) => setEditing((prev) => ({ ...prev, category: e.target.value }))} />

            <div className="checkbox-row">
              <label><input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing((prev) => ({ ...prev, is_active: e.target.checked }))} /> Ativo</label>
              <label><input type="checkbox" checked={editing.is_public ?? true} onChange={(e) => setEditing((prev) => ({ ...prev, is_public: e.target.checked }))} /> Público</label>
              <label><input type="checkbox" checked={editing.is_featured ?? false} onChange={(e) => setEditing((prev) => ({ ...prev, is_featured: e.target.checked }))} /> Destaque</label>
            </div>

            <div className="form-actions">
              <button className="primary-btn" type="submit">Salvar sistema</button>
            </div>
          </form>

          <div className="glass panel">
            <h2>Sistemas cadastrados</h2>
            <div className="table-list">
              {links.map((link) => (
                <div className="table-row" key={link.id}>
                  <div>
                    <strong>{link.title}</strong>
                    <p>{link.description}</p>
                  </div>
                  <div className="row-actions">
                    <button
                      className="ghost-btn"
                      type="button"
                      onClick={() => {
                        setEditing(link);
                        setIconQuery(link.icon_name || '');
                      }}
                    >
                      Editar
                    </button>
                    <button className="danger-btn" type="button" onClick={() => deleteLink(link.id)}>Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form className="glass panel admin-form" onSubmit={saveAnnouncement}>
            <h2>{editingAnnouncement.id ? 'Editar aviso' : 'Novo aviso e popup'}</h2>

            <label className="field-label">Título</label>
            <input
              value={editingAnnouncement.title || ''}
              onChange={(e) => setEditingAnnouncement((prev) => ({ ...prev, title: e.target.value }))}
              required
            />

            <label className="field-label">Mensagem</label>
            <textarea
              value={editingAnnouncement.message || ''}
              onChange={(e) => setEditingAnnouncement((prev) => ({ ...prev, message: e.target.value }))}
              required
            />

            <label className="field-label">Início de exibição</label>
            <div className="calendar-field">
              <CalendarDays size={16} />
              <input
                type="datetime-local"
                value={toInputDate(editingAnnouncement.start_at)}
                onChange={(e) => setEditingAnnouncement((prev) => ({ ...prev, start_at: fromInputDate(e.target.value) }))}
              />
            </div>

            <label className="field-label">Fim de exibição</label>
            <div className="calendar-field">
              <CalendarDays size={16} />
              <input
                type="datetime-local"
                value={toInputDate(editingAnnouncement.end_at)}
                onChange={(e) => setEditingAnnouncement((prev) => ({ ...prev, end_at: fromInputDate(e.target.value) }))}
              />
            </div>

            <label><input type="checkbox" checked={editingAnnouncement.is_active ?? true} onChange={(e) => setEditingAnnouncement((prev) => ({ ...prev, is_active: e.target.checked }))} /> Aviso ativo</label>

            <div className="form-actions">
              <button className="primary-btn" type="button" onClick={() => setEditingAnnouncement(INITIAL_ANNOUNCEMENT)}>Limpar</button>
              <button className="primary-btn" type="submit">Salvar aviso</button>
            </div>

            <div className="table-list">
              {announcements.map((item) => (
                <div className="table-row" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.message}</p>
                    <small>{item.start_at ? new Date(item.start_at).toLocaleString('pt-BR') : 'Sem data inicial'} | {item.end_at ? new Date(item.end_at).toLocaleString('pt-BR') : 'Sem data final'}</small>
                  </div>
                  <div className="row-actions">
                    <button className="ghost-btn" type="button" onClick={() => setEditingAnnouncement(item)}>Editar</button>
                    <button className="danger-btn" type="button" onClick={() => deleteAnnouncement(item.id)}>Excluir</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="suggestions-block">
              <h2>Sugestoes</h2>
              <div className="table-list">
                {pagedSuggestions.map((item) => (
                  <div className="table-row" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.sector}</p>
                    </div>
                    <div className="row-actions">
                      <small>{new Date(item.created_at).toLocaleString('pt-BR')}</small>
                      <button type="button" className="icon-btn" aria-label="Visualizar sugestao" onClick={() => setSelectedSuggestion(item)}>
                        <Eye size={13} />
                      </button>
                      <button type="button" className="icon-btn" aria-label="Excluir sugestao" onClick={() => deleteSuggestion(item.id)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {suggestions.length > SUGGESTIONS_PER_PAGE && (
                <div className="pagination-row">
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => setSuggestionsPage((prev) => Math.max(1, prev - 1))}
                    disabled={suggestionsPage === 1}
                  >
                    Anterior
                  </button>
                  <small>
                    Pagina {suggestionsPage} de {totalSuggestionPages}
                  </small>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => setSuggestionsPage((prev) => Math.min(totalSuggestionPages, prev + 1))}
                    disabled={suggestionsPage === totalSuggestionPages}
                  >
                    Proxima
                  </button>
                </div>
              )}
            </div>
          </form>
        </section>
      </div>

      {selectedSuggestion && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal suggestion-modal glass admin-form">
            <h2>Sugestao</h2>
            <label className="field-label">Nome</label>
            <input value={selectedSuggestion.name} readOnly />

            <label className="field-label">Setor</label>
            <input value={selectedSuggestion.sector} readOnly />

            <label className="field-label">Descricao</label>
            <textarea value={selectedSuggestion.description} readOnly />

            <div className="modal-actions">
              <button type="button" className="primary-btn" onClick={() => setSelectedSuggestion(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
