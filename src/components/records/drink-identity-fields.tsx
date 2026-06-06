"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { SakeSuggestion } from "@/lib/sakenowa/types";
import { SakenowaAttribution } from "./sakenowa-attribution";

type DrinkIdentityFieldsProps = {
  enableSakeSuggest: boolean;
  nameField: string;
  subInfoField: string;
  nameId: string;
  subInfoId: string;
  defaultName?: string;
  defaultSubInfo?: string;
  nameLabel?: string;
  subInfoLabel?: string;
  namePlaceholder?: string;
  subInfoPlaceholder?: string;
};

export function DrinkIdentityFields({
  enableSakeSuggest,
  nameField,
  subInfoField,
  nameId,
  subInfoId,
  defaultName = "",
  defaultSubInfo = "",
  nameLabel = "名前",
  subInfoLabel = "補助情報",
  namePlaceholder = "銘柄名・商品名",
  subInfoPlaceholder = "蔵元、スタイル、生産地 など",
}: DrinkIdentityFieldsProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(defaultName);
  const [subInfo, setSubInfo] = useState(defaultSubInfo);
  const [suggestions, setSuggestions] = useState<SakeSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    if (!enableSakeSuggest) {
      return;
    }

    const query = name.trim();
    if (query.length < 1) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/sakenowa/suggest?q=${encodeURIComponent(query)}`,
        );
        const payload = (await response.json()) as {
          suggestions?: SakeSuggestion[];
        };
        const nextSuggestions = payload.suggestions ?? [];

        if (!cancelled) {
          setSuggestions(nextSuggestions);
          setIsOpen(nextSuggestions.length > 0);
          setHighlightedIndex(-1);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [enableSakeSuggest, name]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(suggestion: SakeSuggestion) {
    setName(suggestion.brandName);
    setSubInfo(suggestion.breweryName);
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleNameKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : 0,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1,
      );
    }

    if (event.key === "Enter" && highlightedIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[highlightedIndex]);
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative">
        <label
          htmlFor={nameId}
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          {nameLabel}
        </label>
        <input
          id={nameId}
          name={nameField}
          type="text"
          required
          value={name}
          onChange={(event) => {
            const nextName = event.target.value;
            setName(nextName);

            if (!nextName.trim()) {
              setSuggestions([]);
              setIsOpen(false);
              setHighlightedIndex(-1);
            }
          }}
          onFocus={() => {
            if (enableSakeSuggest && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleNameKeyDown}
          placeholder={
            enableSakeSuggest ? "銘柄名を入力すると候補が表示されます" : namePlaceholder
          }
          autoComplete="off"
          role={enableSakeSuggest ? "combobox" : undefined}
          aria-expanded={enableSakeSuggest ? isOpen : undefined}
          aria-controls={enableSakeSuggest ? listboxId : undefined}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />

        {enableSakeSuggest && isOpen ? (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion.brandId}
                role="option"
                aria-selected={highlightedIndex === index}
              >
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                  className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-zinc-100 ${
                    highlightedIndex === index ? "bg-zinc-100" : ""
                  }`}
                >
                  <span className="font-medium text-zinc-900">
                    {suggestion.brandName}
                  </span>
                  {suggestion.breweryName ? (
                    <span className="mt-0.5 block text-zinc-500">
                      {suggestion.breweryName}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {enableSakeSuggest && isLoading ? (
          <p className="mt-1 text-xs text-zinc-400">候補を検索中...</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor={subInfoId}
          className="mb-1.5 block text-sm font-medium text-zinc-700"
        >
          {subInfoLabel}
        </label>
        <input
          id={subInfoId}
          name={subInfoField}
          type="text"
          value={subInfo}
          onChange={(event) => setSubInfo(event.target.value)}
          placeholder={
            enableSakeSuggest ? "蔵元名（候補選択で自動入力）" : subInfoPlaceholder
          }
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
        />
      </div>

      {enableSakeSuggest ? <SakenowaAttribution /> : null}
    </div>
  );
}
