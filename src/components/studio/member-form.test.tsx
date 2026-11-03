import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import { MEMBER_LIMITS, type Member } from "@/lib/card/schema";

import { MemberForm } from "./member-form";

/** Holds state like the studio does, and exposes every change to the test. */
function Harness({ onChange }: { onChange: (member: Member) => void }) {
  const [member, setMember] = useState<Member>(DEFAULT_CARD_CONFIG.member);
  return (
    <MemberForm
      member={member}
      onChange={(next) => {
        setMember(next);
        onChange(next);
      }}
    />
  );
}

function setup() {
  const user = userEvent.setup();
  const onChange = vi.fn<(member: Member) => void>();
  render(<Harness onChange={onChange} />);
  const lastMember = () => onChange.mock.lastCall?.[0];
  return { user, onChange, lastMember };
}

describe("MemberForm", () => {
  it("prefills the inputs from the member", () => {
    setup();

    expect(screen.getByLabelText("Full name")).toHaveValue("Ada Lovelace");
    expect(screen.getByLabelText("Member since")).toHaveValue("2026");
    expect(screen.getByLabelText("Member ID")).toHaveValue("");
  });

  it("sends each valid edit to the parent", async () => {
    const { user, lastMember } = setup();
    const name = screen.getByLabelText("Full name");

    await user.clear(name);
    await user.type(name, "Grace Hopper");

    expect(lastMember()?.fullName).toBe("Grace Hopper");
  });

  it("shows a live character counter tied to the input", async () => {
    const { user } = setup();
    const title = screen.getByLabelText("Job title");

    await user.clear(title);
    await user.type(title, "Admiral");

    const counter = screen.getByText(`7/${MEMBER_LIMITS.title}`);
    expect(title).toHaveAccessibleDescription(
      expect.stringContaining(counter.textContent!),
    );
  });

  it("stops typing at the character limit", async () => {
    const { user } = setup();
    const title = screen.getByLabelText("Job title");

    await user.clear(title);
    await user.type(title, "x".repeat(MEMBER_LIMITS.title + 5));

    expect(title).toHaveValue("x".repeat(MEMBER_LIMITS.title));
  });

  it("flags an invalid value and keeps it out of the card", async () => {
    const { user, onChange } = setup();
    const year = screen.getByLabelText("Member since");

    await user.clear(year);
    onChange.mockClear();
    await user.type(year, "1850");

    expect(year).toHaveAttribute("aria-invalid", "true");
    expect(year).toHaveAccessibleDescription("Enter a year from 1900 to 2100");
    expect(onChange).not.toHaveBeenCalledWith(
      expect.objectContaining({ memberSince: 1850 }),
    );
  });

  it("clears the error once the value is fixed", async () => {
    const { user, lastMember } = setup();
    const name = screen.getByLabelText("Full name");

    await user.clear(name);
    expect(screen.getByText("Enter a name")).toBeInTheDocument();

    await user.type(name, "Ada");
    expect(screen.queryByText("Enter a name")).not.toBeInTheDocument();
    expect(name).not.toHaveAttribute("aria-invalid");
    expect(lastMember()?.fullName).toBe("Ada");
  });

  it("treats a cleared optional field as unset", async () => {
    const { user, lastMember } = setup();
    const memberId = screen.getByLabelText("Member ID");

    await user.type(memberId, "1234 5678 901");
    expect(lastMember()?.memberId).toBe("1234 5678 901");

    await user.clear(memberId);
    expect(lastMember()?.memberId).toBeUndefined();
  });

  it("shows hints for optional fields", () => {
    setup();

    expect(screen.getByLabelText("Member ID")).toHaveAccessibleDescription(
      "Leave blank to generate one from the name.",
    );
  });
});
