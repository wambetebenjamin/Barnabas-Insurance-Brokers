"use client";

/**
 * Form primitives.
 *
 * Every control is a minimum of 48px tall (--b-touch), carries the focus ring
 * from globals.css, and has a full set of motion states: hover, focus, invalid,
 * and an active press that scales by a hair. Invalid fields are announced with
 * aria-invalid and tied to their message through aria-describedby.
 */
import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, InputHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, required, children }: FieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  return (
    <div className="b-field">
      <label htmlFor={htmlFor}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
        {required ? <span className="b-visually-hidden"> (required)</span> : null}
      </label>
      {children}
      {hint ? (
        <span className="b-hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="b-error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; describedBy?: string };

export function Input({ invalid, describedBy, className = "", ...rest }: InputProps) {
  return (
    <input
      {...rest}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={`b-input ${className}`}
    />
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export function Textarea({ invalid, className = "", ...rest }: TextareaProps) {
  return <textarea {...rest} aria-invalid={invalid || undefined} className={`b-textarea ${className}`} />;
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function Select({ invalid, className = "", children, ...rest }: SelectProps) {
  return (
    <select {...rest} aria-invalid={invalid || undefined} className={`b-select ${className}`}>
      {children}
    </select>
  );
}

/** Checkbox or radio presented as a large, tappable card. */
export function Option({
  type = "radio",
  name,
  value,
  checked,
  onChange,
  title,
  description,
}: {
  type?: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description?: string;
}) {
  return (
    <label className={`b-option ${checked ? "is-selected" : ""}`}>
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span>
        <strong>{title}</strong>
        {description ? <span>{description}</span> : null}
      </span>
    </label>
  );
}

/** Required consent line, used by every form that stores personal data. */
export function ConsentCheckbox({
  id,
  checked,
  onChange,
  children,
  error,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  error?: string;
}) {
  return (
    <div className="b-field">
      <label className={`b-option ${checked ? "is-selected" : ""}`} htmlFor={id}>
        <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
        <span>
          <strong>Consent</strong>
          <span>{children}</span>
        </span>
      </label>
      {error ? (
        <span className="b-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
