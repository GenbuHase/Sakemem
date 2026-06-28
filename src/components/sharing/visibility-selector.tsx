import type { RecordVisibility } from "@/lib/types/record";

const VISIBILITY_OPTIONS: {
  value: RecordVisibility;
  label: string;
  description: string;
}[] = [
  {
    value: "private",
    label: "非公開",
    description: "本人のみ閲覧できます。",
  },
  {
    value: "unlisted",
    label: "限定公開（URL）",
    description: "URL を知っている人のみ。プロフィールには載りません。",
  },
  {
    value: "public",
    label: "公開（プロフィールに表示）",
    description: "誰でも閲覧でき、公開プロフィールに表示されます。",
  },
];

type VisibilitySelectorProps = {
  defaultValue?: RecordVisibility;
  defaultHidePlace?: boolean;
};

export function VisibilitySelector({
  defaultValue = "private",
  defaultHidePlace = false,
}: VisibilitySelectorProps) {
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-medium text-zinc-900">公開範囲</legend>
        <div className="mt-2 space-y-2">
          {VISIBILITY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer gap-3 rounded-lg border border-zinc-200 p-3 has-checked:border-zinc-400 has-checked:bg-zinc-50"
            >
              <input
                type="radio"
                name="visibility"
                value={option.value}
                defaultChecked={defaultValue === option.value}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium text-zinc-900">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          name="hide_place_when_shared"
          defaultChecked={defaultHidePlace}
          className="mt-0.5"
        />
        <span>
          <span className="font-medium">場所を共有しない</span>
          <span className="mt-0.5 block text-xs text-zinc-500">
            共有ページでは場所を表示しません。
          </span>
        </span>
      </label>
    </div>
  );
}
