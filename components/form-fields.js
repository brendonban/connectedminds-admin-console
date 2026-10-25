"use client";

export function Field({ label, value, onChange, placeholder, className = "" }) {
  return (
    <label className={`grid gap-1 ${className}`}>
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-divider px-3 py-2 w-full outline-none focus:border-accent-primary bg-transparent"
      />
    </label>
  );
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3, className = "" }) {
  return (
    <label className={`grid gap-1 ${className}`}>
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-lg border border-divider px-3 py-2 w-full outline-none focus:border-accent-primary bg-transparent resize-y"
      />
    </label>
  );
}

export function RemoveButton({ onClick, label = "Remove" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm text-danger hover:underline shrink-0"
    >
      {label}
    </button>
  );
}

export function AddButton({ onClick, label = "+ Add" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-medium text-accent-primary hover:underline w-fit"
    >
      {label}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl border border-divider p-4 grid gap-3 ${className}`}>
      {children}
    </div>
  );
}

export function Section({ title, description, children, action }) {
  return (
    <section className="grid gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-0.5">
          <h2 className="text-lg font-bold">{title}</h2>
          {description && <p className="text-muted text-sm">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Editable list of plain strings (e.g. compensation bullets, FAQ answers list). */
export function StringListField({ label, items, onChange, placeholder }) {
  const list = items || [];

  function updateAt(i, value) {
    const next = [...list];
    next[i] = value;
    onChange(next);
  }

  function removeAt(i) {
    onChange(list.filter((_, idx) => idx !== i));
  }

  function add() {
    onChange([...list, ""]);
  }

  return (
    <div className="grid gap-2">
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
      <div className="grid gap-2">
        {list.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateAt(i, e.target.value)}
              placeholder={placeholder}
              className="rounded-lg border border-divider px-3 py-2 w-full outline-none focus:border-accent-primary bg-transparent"
            />
            <RemoveButton onClick={() => removeAt(i)} />
          </div>
        ))}
      </div>
      <AddButton onClick={add} />
    </div>
  );
}
