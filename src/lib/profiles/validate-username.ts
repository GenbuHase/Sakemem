const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,30}$/;

export function validateUsernameFormat(username: string): string | null {
  const trimmed = username.trim();
  if (!trimmed) {
    return "ユーザー名を入力してください。";
  }
  if (!USERNAME_PATTERN.test(trimmed)) {
    return "ユーザー名は3〜30文字の英数字・ハイフン・アンダースコアのみ使用できます。";
  }
  return null;
}

export function normalizeUsername(username: string): string {
  return username.trim();
}
