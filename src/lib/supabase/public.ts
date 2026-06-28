import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** 公開ページ向け。Cookie を使わず OGP クローラーでも安定して RPC を呼べる。 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
