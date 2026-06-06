type RatingInputProps = {
  name: string;
  label: string;
  defaultValue?: number | null;
};

export function RatingInput({ name, label, defaultValue }: RatingInputProps) {
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-zinc-700">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        <label className="flex cursor-pointer items-center gap-1.5 text-sm text-zinc-500">
          <input
            type="radio"
            name={name}
            value=""
            defaultChecked={!defaultValue}
            className="accent-zinc-900"
          />
          未評価
        </label>
        {[1, 2, 3, 4, 5].map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-1.5 text-sm text-zinc-700"
          >
            <input
              type="radio"
              name={name}
              value={value}
              defaultChecked={defaultValue === value}
              className="accent-zinc-900"
            />
            {value}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
