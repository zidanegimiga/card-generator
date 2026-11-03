import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { useCustomFonts } from "@/hooks/use-custom-fonts";
import { DEFAULT_CARD_CONFIG } from "@/lib/card/defaults";
import type { FontSource } from "@/lib/card/schema";
import { createFontDeps } from "@/test/font-deps";
import { fakeFontFile } from "@/test/font-files";

import { FontPicker } from "./font-picker";

type Deps = ReturnType<typeof createFontDeps>["deps"];

function Harness({
  deps,
  onChange,
}: {
  deps: Deps;
  onChange: (font: FontSource) => void;
}) {
  const customFonts = useCustomFonts(deps);
  const [font, setFont] = useState<FontSource>(DEFAULT_CARD_CONFIG.font);
  return (
    <FontPicker
      value={font}
      customFonts={customFonts}
      onChange={(next) => {
        setFont(next);
        onChange(next);
      }}
    />
  );
}

function setup(...args: Parameters<typeof createFontDeps>) {
  const user = userEvent.setup();
  const onChange = vi.fn<(font: FontSource) => void>();
  const fontDeps = createFontDeps(...args);
  render(<Harness deps={fontDeps.deps} onChange={onChange} />);
  const uploadInput = () => screen.getByLabelText(/Upload a font/);
  return { user, onChange, uploadInput, ...fontDeps };
}

describe("FontPicker", () => {
  it("selects the current font", () => {
    setup();

    expect(screen.getByRole("radio", { name: /Geist/ })).toBeChecked();
  });

  it("switches to a Google font", async () => {
    const { user, onChange } = setup();

    await user.click(screen.getByRole("radio", { name: /Fraunces/ }));

    expect(onChange).toHaveBeenLastCalledWith({
      kind: "google",
      family: "Fraunces",
    });
    expect(screen.getByRole("radio", { name: /Fraunces/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Geist/ })).not.toBeChecked();
  });

  it("previews each option in its own font", () => {
    setup();

    expect(screen.getByText("Fraunces")).toHaveStyle({
      fontFamily: '"Fraunces", ui-serif, Georgia, serif',
    });
  });

  it("uploads a font and selects it", async () => {
    const { user, onChange, uploadInput } = setup();

    await user.upload(uploadInput(), fakeFontFile("Acme-Grotesk.woff2"));

    const option = await screen.findByRole("radio", { name: /Acme Grotesk/ });
    expect(option).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ kind: "custom", family: "Acme Grotesk" }),
    );
  });

  it("accepts a dropped font file", async () => {
    setup();
    const dropzone = screen.getByText("Upload a font").closest("label")!;

    fireEvent.drop(dropzone, {
      dataTransfer: { files: [fakeFontFile("Dropped.otf", "otf")] },
    });

    expect(await screen.findByRole("radio", { name: /Dropped/ })).toBeChecked();
  });

  it("explains why an upload was rejected", async () => {
    const { user, uploadInput, onChange } = setup();

    await user.upload(uploadInput(), new File(["text"], "notes.woff2"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "That file isn't a font we can read.",
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clears the error after a successful upload", async () => {
    const { user, uploadInput } = setup();

    await user.upload(uploadInput(), new File(["text"], "notes.woff2"));
    await screen.findByRole("alert");
    await user.upload(uploadInput(), fakeFontFile("Good.woff2"));

    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
  });

  it("only offers supported file types in the file chooser", () => {
    const { uploadInput } = setup();

    expect(uploadInput()).toHaveAttribute("accept", ".woff2,.woff,.ttf,.otf");
  });

  it("falls back to the default font when the selected upload is removed", async () => {
    const { user, uploadInput, onChange } = setup();

    await user.upload(uploadInput(), fakeFontFile("Temp.woff2"));
    await screen.findByRole("radio", { name: /Temp/ });
    await user.click(screen.getByRole("button", { name: "Remove Temp" }));

    await waitFor(() =>
      expect(
        screen.queryByRole("radio", { name: /Temp/ }),
      ).not.toBeInTheDocument(),
    );
    expect(onChange).toHaveBeenLastCalledWith(DEFAULT_CARD_CONFIG.font);
    expect(screen.getByRole("radio", { name: /Geist/ })).toBeChecked();
  });

  it("shows fonts saved in an earlier session", async () => {
    setup([
      {
        id: "old",
        family: "Old Favourite",
        fileName: "old.woff2",
        format: "woff2",
        data: new ArrayBuffer(4),
        addedAt: 1,
      },
    ]);

    expect(
      await screen.findByRole("radio", { name: /Old Favourite/ }),
    ).not.toBeChecked();
  });
});
