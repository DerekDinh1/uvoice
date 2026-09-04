interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

// A labeled checkbox for the profile's boolean fields (explanation style).
// The label wraps the input, so the association is implicit and needs no id.
export function CheckboxField({
  label,
  checked,
  onChange,
}: CheckboxFieldProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-text">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-accent"
      />
      <span>{label}</span>
    </label>
  );
}
