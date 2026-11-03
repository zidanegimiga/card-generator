"use client";

import { useState } from "react";

import {
  MEMBER_FIELDS,
  type MemberDraft,
  type MemberFieldName,
  parseMemberField,
  toMemberDraft,
} from "@/lib/card/member-fields";
import { MEMBER_LIMITS, type Member } from "@/lib/card/schema";

import { ImageField } from "../image-field";
import { type FieldMeta, TextField } from "../text-field";
import styles from "./member-form.module.css";

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
      className={styles.form}
    >
      <ImageField
        label="Photo"
        alt={`Photo of ${member.fullName}`}
        value={member.photoUrl}
        fit="cover"
        onChange={(photoUrl) => onChange({ ...member, photoUrl })}
      />
      {MEMBER_FIELDS.map((name) => (
        <TextField
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
