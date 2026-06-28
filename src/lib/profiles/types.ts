export type Profile = {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type PublicProfile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
};

export type CreateProfileInput = {
  username: string;
  display_name: string;
  bio?: string | null;
  avatar_url?: string | null;
};

export type UpdateProfileInput = {
  username?: string;
  display_name?: string;
  bio?: string | null;
  avatar_url?: string | null;
};
