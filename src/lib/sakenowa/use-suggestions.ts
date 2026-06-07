"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useState } from "react";
import type { SakeSuggestion } from "@/lib/sakenowa/types";

const DEBOUNCE_MS = 300;

type SuggestionsState = {
  suggestions: SakeSuggestion[];
  isOpen: boolean;
  isLoading: boolean;
  highlightedIndex: number;
};

const INITIAL_STATE: SuggestionsState = {
  suggestions: [],
  isOpen: false,
  isLoading: false,
  highlightedIndex: -1,
};

export type UseSakeSuggestionsResult = SuggestionsState & {
  open(): void;
  close(): void;
  reset(): void;
  setHighlightedIndex(index: number): void;
  handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void;
};

export function useSakeSuggestions(
  query: string,
  enabled: boolean,
  onSelect?: (suggestion: SakeSuggestion) => void,
): UseSakeSuggestionsResult {
  const [state, setState] = useState<SuggestionsState>(INITIAL_STATE);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 1) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const response = await fetch(
          `/api/sakenowa/suggest?q=${encodeURIComponent(trimmed)}`,
        );
        const payload = (await response.json()) as {
          suggestions?: SakeSuggestion[];
        };
        const next = payload.suggestions ?? [];

        if (!cancelled) {
          setState({
            suggestions: next,
            isOpen: next.length > 0,
            isLoading: false,
            highlightedIndex: -1,
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            suggestions: [],
            isOpen: false,
            isLoading: false,
            highlightedIndex: -1,
          });
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enabled, query]);

  function open() {
    setState((prev) =>
      prev.suggestions.length > 0 ? { ...prev, isOpen: true } : prev,
    );
  }

  function close() {
    setState((prev) =>
      prev.isOpen ? { ...prev, isOpen: false, highlightedIndex: -1 } : prev,
    );
  }

  function reset() {
    setState(INITIAL_STATE);
  }

  function setHighlightedIndex(index: number) {
    setState((prev) => ({ ...prev, highlightedIndex: index }));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const { suggestions, isOpen, highlightedIndex } = state;
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex(
          highlightedIndex < suggestions.length - 1
            ? highlightedIndex + 1
            : 0,
        );
        break;

      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex(
          highlightedIndex > 0
            ? highlightedIndex - 1
            : suggestions.length - 1,
        );
        break;

      case "Enter":
        if (highlightedIndex >= 0) {
          event.preventDefault();
          onSelect?.(suggestions[highlightedIndex]);
        }
        break;

      case "Escape":
        close();
        break;
    }
  }

  return {
    ...state,
    open,
    close,
    reset,
    setHighlightedIndex,
    handleKeyDown,
  };
}
