import { useState } from 'react';
import { buttonClass } from '../ui/buttonStyles';

interface EditableTagListProps {
  items: string[];
  onChange: (items: string[]) => void;
  // Describes what a new item is added to, e.g. "Add to voice". Used as the
  // accessible label for the input and the add button, and as the input's
  // placeholder.
  addLabel: string;
}

// Editable counterpart to TagList: existing items show as removable chips, and
// a text input adds a new one on Enter or via the Add button. Input is trimmed
// and empty or duplicate entries are ignored.
export function EditableTagList({
  items,
  onChange,
  addLabel,
}: EditableTagListProps) {
  const [draftValue, setDraftValue] = useState('');

  function addItem() {
    const trimmed = draftValue.trim();
    if (trimmed.length === 0 || items.includes(trimmed)) {
      setDraftValue('');
      return;
    }
    onChange([...items, trimmed]);
    setDraftValue('');
  }

  function removeItem(item: string) {
    onChange(items.filter((existing) => existing !== item));
  }

  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-sm text-muted">Nothing recorded.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-text"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeItem(item)}
                aria-label={`Remove ${item}`}
                className="text-muted hover:text-danger"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={draftValue}
          onChange={(event) => setDraftValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addItem();
            }
          }}
          placeholder={addLabel}
          aria-label={addLabel}
          className="flex-1 rounded-md border border-border bg-bg p-2 text-sm text-text"
        />
        <button
          type="button"
          onClick={addItem}
          className={buttonClass('secondary', 'px-3 py-2')}
        >
          Add
        </button>
      </div>
    </div>
  );
}
