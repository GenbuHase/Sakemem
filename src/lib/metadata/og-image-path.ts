export function buildProfileOgImagePath(username: string): string {
  return `/@${username}/opengraph-image`;
}

export function buildRecordOgImagePath(
  username: string,
  recordId: string,
): string {
  return `/@${username}/${recordId}/opengraph-image`;
}
