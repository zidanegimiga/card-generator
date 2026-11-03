import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import { type Finish, FINISHES } from "@/lib/card/schema";

import { FinishPicker } from "./finish-picker";

function Harness({ onChange }: { onChange: (finish: Finish) => void }) {
  const [finish, setFinish] = useState<Finish>("brand");
  return (
    <FinishPicker
      value={finish}
      brandColors={DEFAULT_CARD_CONFIG.brand.colors}
      onChange={(next) => {
        setFinish(next);
        onChange(next);
      }}
    />
  );
}

describe("FinishPicker", () => {
  it("groups every finish under one label", () => {
    render(<Harness onChange={vi.fn()} />);

    const group = screen.getByRole("group", { name: "Finish" });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(FINISHES.length);
    expect(screen.getByRole("radio", { name: "Brand" })).toBeChecked();
  });

  it("switches finish", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: "Gold" }));

    expect(onChange).toHaveBeenCalledWith("gold");
    expect(screen.getByRole("radio", { name: "Gold" })).toBeChecked();
  });
});
