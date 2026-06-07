"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Field } from "@/components/ui/field";
import { TextInput } from "@/components/ui/inputs";
import type { SakeSuggestion } from "@/lib/sakenowa/types";
import { useSakeSuggestions } from "@/lib/sakenowa/use-suggestions";
import { SakenowaAttribution } from "./sakenowa-attribution";

type DrinkIdentityFieldsProps = {
  enableSakeSuggest: boolean;
  showProducer?: boolean;
  nameField: string;
  producerField?: string;
  subInfoField: string;
  nameId: string;
  producerId?: string;
  subInfoId: string;
  defaultName?: string;
  defaultProducer?: string;
  defaultSubInfo?: string;
  nameLabel?: string;
  producerLabel?: string;
  subInfoLabel?: string;
  namePlaceholder?: string;
  producerPlaceholder?: string;
  subInfoPlaceholder?: string;
  nameRequired?: boolean;
};

export function DrinkIdentityFields({
  enableSakeSuggest,
  showProducer = false,
  nameField,
  producerField = "record_producer",
  subInfoField,
  nameId,
  producerId = "record_producer",
  subInfoId,
  defaultName = "",
  defaultProducer = "",
  defaultSubInfo = "",
  nameLabel = "名前",
  producerLabel = "蔵元 / メーカー",
  subInfoLabel = "補助情報",
  namePlaceholder = "銘柄名・商品名",
  producerPlaceholder = "蔵元名、ビールメーカー など",
  subInfoPlaceholder = "スタイル、生産地 など",
  nameRequired = true,
}: DrinkIdentityFieldsProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(defaultName);
  const [producer, setProducer] = useState(defaultProducer);
  const [subInfo, setSubInfo] = useState(defaultSubInfo);

  const suggestions = useSakeSuggestions(
    name,
    enableSakeSuggest,
    selectSuggestion,
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        suggestions.close();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [suggestions]);

  function selectSuggestion(suggestion: SakeSuggestion) {
    setName(suggestion.brandName);
    if (suggestion.breweryName) {
      setProducer(suggestion.breweryName);
    }
    suggestions.reset();
  }

  const namePlaceholderText = enableSakeSuggest
    ? "銘柄名を入力すると候補が表示されます"
    : namePlaceholder;

  const producerPlaceholderText = enableSakeSuggest
    ? "蔵元名（候補選択で自動入力）"
    : producerPlaceholder;

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative">
        <Field htmlFor={nameId} label={nameLabel}>
          <TextInput
            id={nameId}
            name={nameField}
            required={nameRequired}
            value={name}
            onChange={(event) => {
              const next = event.target.value;
              setName(next);
              if (!next.trim()) {
                suggestions.reset();
              }
            }}
            onFocus={() => {
              if (enableSakeSuggest) {
                suggestions.open();
              }
            }}
            onKeyDown={suggestions.handleKeyDown}
            placeholder={namePlaceholderText}
            autoComplete="off"
            role={enableSakeSuggest ? "combobox" : undefined}
            aria-expanded={enableSakeSuggest ? suggestions.isOpen : undefined}
            aria-controls={enableSakeSuggest ? listboxId : undefined}
          />
        </Field>

        {enableSakeSuggest && suggestions.isOpen ? (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
          >
            {suggestions.suggestions.map((suggestion, index) => (
              <li
                key={suggestion.brandId}
                role="option"
                aria-selected={suggestions.highlightedIndex === index}
              >
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                  className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-zinc-100 ${
                    suggestions.highlightedIndex === index ? "bg-zinc-100" : ""
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

        {enableSakeSuggest && suggestions.isLoading ? (
          <p className="mt-1 text-xs text-zinc-400">候補を検索中...</p>
        ) : null}
      </div>

      {showProducer ? (
        <TextInput
          id={producerId}
          name={producerField}
          label={producerLabel}
          value={producer}
          onChange={(event) => setProducer(event.target.value)}
          placeholder={producerPlaceholderText}
        />
      ) : null}

      <TextInput
        id={subInfoId}
        name={subInfoField}
        label={subInfoLabel}
        value={subInfo}
        onChange={(event) => setSubInfo(event.target.value)}
        placeholder={subInfoPlaceholder}
      />

      {enableSakeSuggest ? <SakenowaAttribution /> : null}
    </div>
  );
}
