const STORAGE_KEY = "sakemem:ga-notice-dismissed";
const CHANGE_EVENT = "sakemem:ga-notice-changed";

export function isGaNoticeDismissed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissGaNotice(): void {
  localStorage.setItem(STORAGE_KEY, "1");
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeGaNotice(
  onStoreChange: () => void,
): () => void {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
