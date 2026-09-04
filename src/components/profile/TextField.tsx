interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

// A labeled single-line text input, used for the profile's short descriptive
// fields (sentence style, vocabulary, structure).
export function TextField({ id, label, value, onChange }: TextFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-text">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-border bg-bg p-2 text-sm text-text"
      />
    </div>
  );
}
