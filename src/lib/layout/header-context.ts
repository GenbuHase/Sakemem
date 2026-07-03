import { createClient } from "@/lib/supabase/server";
import { fetchProfileByUserId } from "@/lib/profiles/repository";

export type HeaderUserProfile = {
  displayName: string;
  username: string;
  avatarUrl: string | null;
};

export async function getHeaderContext(): Promise<{
  isLoggedIn: boolean;
  myUsername: string | null;
  userProfile: HeaderUserProfile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isLoggedIn: false,
      myUsername: null,
      userProfile: null,
    };
  }

  const profile = await fetchProfileByUserId(supabase, user.id);

  return {
    isLoggedIn: true,
    myUsername: profile?.username ?? null,
    userProfile: profile
      ? {
          displayName: profile.display_name,
          username: profile.username,
          avatarUrl: profile.avatar_url,
        }
      : null,
  };
}
