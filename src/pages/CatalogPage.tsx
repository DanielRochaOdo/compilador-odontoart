import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Headset, Shield } from 'lucide-react';
import { LinkCard } from '../components/LinkCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { AnnouncementModal } from '../components/AnnouncementModal';
import { SuggestionModal } from '../components/SuggestionModal';
import { supabase } from '../lib/supabase';
import type { Announcement, CatalogLink } from '../types';

const THEME_KEY = 'portal-theme';
const FAVORITES_KEY = 'portal-favorites';
const POPUP_SNOOZE_KEY_PREFIX = 'portal-popup-snooze-until:';

export function CatalogPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light');
  const [query, setQuery] = useState('');
  const [links, setLinks] = useState<CatalogLink[]>([]);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const loadLinks = async () => {
      const { data } = await supabase
        .from('catalog_links')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)
        .order('title', { ascending: true })
        .order('created_at', { ascending: true });

      setLinks((data ?? []) as CatalogLink[]);
    };

    loadLinks();
  }, []);

  useEffect(() => {
    const loadAnnouncement = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .or(`start_at.is.null,start_at.lte.${now}`)
        .or(`end_at.is.null,end_at.gte.${now}`)
        .limit(1)
        .order('updated_at', { ascending: false });

      const current = data?.[0] as Announcement | undefined;
      if (!current) return;

      const snoozeUntilRaw = localStorage.getItem(`${POPUP_SNOOZE_KEY_PREFIX}${current.id}`);
      if (snoozeUntilRaw) {
        const snoozeUntil = Number(snoozeUntilRaw);
        if (!Number.isNaN(snoozeUntil) && Date.now() < snoozeUntil) return;
      }

      setAnnouncement(current);
    };

    loadAnnouncement();
  }, []);

  const orderedLinks = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const filtered = normalized
      ? links.filter((link) => [link.title, link.description, link.category || ''].join(' ').toLowerCase().includes(normalized))
      : links;

    return [...filtered].sort((a, b) => {
      const aFav = favorites.includes(a.id) ? 0 : 1;
      const bFav = favorites.includes(b.id) ? 0 : 1;
      if (aFav !== bFav) return aFav - bFav;
      return a.title.localeCompare(b.title, 'pt-BR');
    });
  }, [links, favorites, query]);

  const handleToggleFavorite = (linkId: string) => {
    const isFavorite = favorites.includes(linkId);
    setFavorites((prev) => (isFavorite ? prev.filter((id) => id !== linkId) : [...prev, linkId]));
  };

  const dismissAnnouncement = () => {
    setAnnouncement(null);
  };

  const snoozeAnnouncement24h = () => {
    if (announcement) {
      const snoozeUntil = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(`${POPUP_SNOOZE_KEY_PREFIX}${announcement.id}`, String(snoozeUntil));
    }
    setAnnouncement(null);
  };

  const submitSuggestion = async (payload: { name: string; sector: string; description: string }) => {
    const { error } = await supabase.from('user_suggestions').insert(payload);
    if (error) {
      throw new Error(`Nao foi possivel enviar: ${error.message}`);
    }
  };

  return (
    <div className="page-shell">
      <header className="header glass">
        <div>
          <h1>Portal Agregador de Sistemas</h1>
          <p>Vitrine interna para acesso rápido e organizado</p>
        </div>
        <div className="header-actions">
          <input placeholder="Buscar sistema..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <Link to="/admin/login" className="icon-btn" aria-label="Área administrativa">
            <Shield size={14} />
          </Link>
          <button type="button" className="icon-btn" aria-label="Sugestoes" onClick={() => setShowSuggestionModal(true)}>
            <Headset size={14} />
          </button>
          <ThemeToggle theme={theme} onToggle={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))} />
        </div>
      </header>

      <main className="cards-grid">
        {orderedLinks.map((link) => (
          <LinkCard key={link.id} link={link} isFavorite={favorites.includes(link.id)} onToggleFavorite={handleToggleFavorite} />
        ))}
      </main>

      {announcement && <AnnouncementModal announcement={announcement} onClose={dismissAnnouncement} onSnooze24h={snoozeAnnouncement24h} />}
      {showSuggestionModal && <SuggestionModal onClose={() => setShowSuggestionModal(false)} onSubmit={submitSuggestion} />}
    </div>
  );
}
