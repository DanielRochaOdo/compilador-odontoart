export type FrequencyType = 'always' | 'once_per_login' | 'once_per_day' | 'every_x_hours' | 'between_dates';

export interface CatalogLink {
  id: string;
  title: string;
  description: string;
  url: string;
  image_url: string | null;
  icon_name: string | null;
  category: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_public: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  link_id: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  start_at: string | null;
  end_at: string | null;
  frequency_type: FrequencyType;
  frequency_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserSuggestion {
  id: string;
  name: string;
  sector: string;
  description: string;
  created_at: string;
}

export interface PopupView {
  id: string;
  user_id: string;
  popup_id: string;
  last_seen_at: string;
  dismissed_at: string | null;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  is_active: boolean;
}
