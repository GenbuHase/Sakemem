import { LinkButton } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 sm:px-6 sm:py-24">
      <main className="w-full max-w-md text-center">
        <p className="text-sm font-medium tracking-widest text-zinc-500 uppercase">
          Sakemem
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          晩酌の記録を、ミニマルに。
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          お酒とおつまみをペアで記録し、あとから振り返るライフログアプリです。
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          {user ? (
            <>
              <LinkButton href="/records" size="lg">
                タイムラインを見る
              </LinkButton>
              <LinkButton href="/records/new" variant="secondary" size="lg">
                記録する
              </LinkButton>
            </>
          ) : (
            <>
              <LinkButton href="/login" variant="secondary" size="lg">
                ログイン
              </LinkButton>
              <LinkButton href="/signup" size="lg">
                新規登録
              </LinkButton>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
