"use client";

import { type HTMLInputTypeAttribute, useId, useState } from "react";

import {
  MEMBER_FIELDS,
  type MemberDraft,
  type MemberFieldName,
  parseMemberField,
  toMemberDraft,
} from "@/lib/card/member-fields";
import { MEMBER_LIMITS, type Member } from "@/lib/card/schema";

type FieldMeta = {
  label: string;
  hint?: string;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: "numeric" | "url";
  maxLength?: number;
};

const FIELD_META: Record<MemberFieldName, FieldMeta> = {
  fullName: { label: "Full name", maxLength: MEMBER_LIMITS.fullName },
  title: { label: "Job title", maxLength: MEMBER_LIMITS.title },
  membership: { label: "Membership", maxLength: MEMBER_LIMITS.membership },
  label: {
    label: "Card label",
    hint: "Optional text in the card's corner.",
    maxLength: MEMBER_LIMITS.label,
  },
  memberSince: { label: "Member since", inputMode: "numeric" },
  memberId: {
    label: "Member ID",
    hint: "Leave blank to generate one from the name.",
    placeholder: "1234 5678 901",
  },
  qrUrl: {
    label: "QR link",
    hint: "Leave blank to use the brand's site.",
    placeholder: "https://example.com",
    type: "url",
    inputMode: "url",
  },
};

type FieldErrors = Partial<Record<MemberFieldName, string>>;

type MemberFormProps = {
  member: Member;
  onChange: (member: Member) => void;
};

/**
 * Keeps raw input locally so invalid text can stay on screen with an error,
 * while only valid values reach the card.
 */
export function MemberForm({ member, onChange }: MemberFormProps) {
  const [draft, setDraft] = useState<MemberDraft>(() => toMemberDraft(member));
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleChange(name: MemberFieldName, raw: string) {
    setDraft((current) => ({ ...current, [name]: raw }));

    const result = parseMemberField(name, raw);
    setErrors((current) => ({
      ...current,
      [name]: result.ok ? undefined : result.error,
    }));
    if (result.ok) onChange({ ...member, [name]: result.value });
  }

  return (
    <form
      aria-label="Member details"
      noValidate
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-5"
    >
      {MEMBER_FIELDS.map((name) => (
        <Field
          key={name}
          meta={FIELD_META[name]}
          value={draft[name]}
          error={errors[name]}
          onChange={(raw) => handleChange(name, raw)}
        />
      ))}
    </form>
  );
}

type FieldProps = {
  meta: FieldMeta;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function Field({ meta, value, error, onChange }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const counterId = `${id}-counter`;

  const describedBy =
    [
      error ? errorId : meta.hint ? hintId : null,
      meta.maxLength ? counterId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm">
          {meta.label}
        </label>
        {meta.maxLength && (
          <span
            id={counterId}
            className="font-mono text-[11px] text-muted tabular-nums"
          >
            {value.length}/{meta.maxLength}
          </span>
        )}
      </div>
      <input
        id={id}
        type={meta.type ?? "text"}
        inputMode={meta.inputMode}
        placeholder={meta.placeholder}
        maxLength={meta.maxLength}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted/60 focus:border-accent aria-invalid:border-red-400"
      />
      {error ? (
        <p id={errorId} className="text-xs text-red-400">
          {error}
        </p>
      ) : (
        meta.hint && (
          <p id={hintId} className="text-xs text-muted">
            {meta.hint}
          </p>
        )
      )}
    </div>
  );
}
