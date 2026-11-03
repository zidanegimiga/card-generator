import { type Member, memberSchema } from "./schema";

/** Member fields the form edits as text. `photoUrl` gets its own upload control. */
export const MEMBER_FIELDS = [
  "fullName",
  "title",
  "membership",
  "label",
  "memberSince",
  "memberId",
  "qrUrl",
] as const satisfies readonly (keyof Member)[];

export type MemberFieldName = (typeof MEMBER_FIELDS)[number];

/** Raw input values exactly as typed, before validation. */
export type MemberDraft = Record<MemberFieldName, string>;

export type FieldResult<K extends MemberFieldName> =
  { ok: true; value: Member[K] } | { ok: false; error: string };

const OPTIONAL_FIELDS: ReadonlySet<MemberFieldName> = new Set([
  "memberId",
  "qrUrl",
]);

function toSchemaInput(name: MemberFieldName, raw: string): unknown {
  if (name === "memberSince")
    return raw.trim() === "" ? undefined : Number(raw);
  if (OPTIONAL_FIELDS.has(name) && raw.trim() === "") return undefined;
  return raw;
}

/** Validates one field with the same rules as the full member schema. */
export function parseMemberField<K extends MemberFieldName>(
  name: K,
  raw: string,
): FieldResult<K> {
  const result = memberSchema.shape[name].safeParse(toSchemaInput(name, raw));
  if (result.success) return { ok: true, value: result.data as Member[K] };
  return {
    ok: false,
    error: result.error.issues[0]?.message ?? "Check this value",
  };
}

export function toMemberDraft(member: Member): MemberDraft {
  return {
    fullName: member.fullName,
    title: member.title,
    membership: member.membership,
    label: member.label,
    memberSince: String(member.memberSince),
    memberId: member.memberId ?? "",
    qrUrl: member.qrUrl ?? "",
  };
}
