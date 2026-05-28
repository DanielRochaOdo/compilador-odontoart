import { Heart } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import type { MouseEvent } from 'react';
import type { CatalogLink } from '../types';

interface LinkCardProps {
  link: CatalogLink;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export function LinkCard({ link, isFavorite, onToggleFavorite }: LinkCardProps) {
  const openLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleFavorite(link.id);
  };

  return (
    <article className="card glass card-clickable" onClick={openLink} role="link" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openLink()}>
      {link.image_url ? (
        <img className="card-image" src={link.image_url} alt={link.title} />
      ) : (
        <div className="card-image card-icon-wrap" aria-hidden="true">
          {link.icon_name ? <DynamicIcon name={link.icon_name as never} size={56} /> : <span className="card-icon-fallback">SYS</span>}
        </div>
      )}
      <div className="card-content">
        <div className="card-top-row">
          <span />
          <button
            className={`icon-btn ${isFavorite ? 'favorite' : ''}`}
            type="button"
            aria-label="Favoritar"
            onClick={handleFavoriteClick}
          >
            <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
        <h3>{link.title}</h3>
        <p>{link.description}</p>
      </div>
    </article>
  );
}
