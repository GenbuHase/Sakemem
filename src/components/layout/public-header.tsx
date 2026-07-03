import { PublicHeaderNav } from "@/components/layout/public-header-nav";
import { getHeaderContext } from "@/lib/layout/header-context";

export async function PublicHeader() {
  const { isLoggedIn, myUsername } = await getHeaderContext();

  return <PublicHeaderNav isLoggedIn={isLoggedIn} myUsername={myUsername} />;
}
