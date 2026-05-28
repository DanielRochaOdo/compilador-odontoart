import type { Announcement } from '../types';

interface AnnouncementModalProps {
  announcement: Announcement;
  onClose: () => void;
  onSnooze24h: () => void;
}

export function AnnouncementModal({ announcement, onClose, onSnooze24h }: AnnouncementModalProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal glass">
        <h2>{announcement.title}</h2>
        <p>{announcement.message}</p>
        <div className="modal-actions">
          <button className="ghost-btn" type="button" onClick={onSnooze24h}>
            Nao mostrar nas proximas 24hrs
          </button>
          <button className="primary-btn" type="button" onClick={onClose}>
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}

