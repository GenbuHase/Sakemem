import { PublicHeaderNav } from "@/components/layout/public-header-nav";
import { fetchProfileByUserId } from "@/lib/profiles/repository";
import { createClient } from "@/lib/supabase/server";

export async function PublicHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let myUsername: string | null = null;
  if (user) {
    const myProfile = await fetchProfileByUserId(supabase, user.id);
    myUsername = myProfile?.username ?? null;
  }

  return (
    <PublicHeaderNav isLoggedIn={!!user} myUsername={myUsername} />
  );
}
