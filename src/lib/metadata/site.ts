export const siteName = "Sakemem";
export const defaultDescription = "お酒とおつまみの晩酌記録アプリ";

export function getMetadataBase(): URL {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url) {
    return new URL("http://localhost:3000");
  }
  return new URL(url);
}
