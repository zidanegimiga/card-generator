"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import type { BrandPull } from "@/lib/brand-pull/brand-pull-schema";
import {
  type BrandPullResult,
  requestBrandPull,
} from "@/lib/brand-pull/client";

type BrandPullFormProps = {
  onPull: (brand: BrandPull) => void;
  request?: (site: string) => Promise<BrandPullResult>;
};

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "done"; name: string }
  | { type: "error"; message: string };

export function BrandPullForm({
  onPull,
  request = requestBrandPull,
}: BrandPullFormProps) {
  const id = useId();
  const [site, setSite] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!site.trim()) {
      setStatus({
        type: "error",
        message: "Enter a website, like linear.app.",
      });
      return;
    }
    setStatus({ type: "loading" });
    const result = await request(site);
    if (result.ok) {
      onPull(result.brand);
      setStatus({ type: "done", name: result.brand.name });
    } else {
      setStatus({ type: "error", message: result.error });
    }
  }

  const loading = status.type === "loading";

  return (
    <form
      aria-label="Pull brand from a website"
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-1.5 border-b border-border pb-6"
    >
      <label htmlFor={id} className="text-sm">
        Pull from a website
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          value={site}
          onChange={(event) => setSite(event.target.value)}
          placeholder="linear.app"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          aria-describedby={`${id}-status`}
          className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-muted/60 focus:border-foreground/50"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-foreground px-3 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Pulling…" : "Pull"}
          {loading ? (
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
          ) : (
            <ArrowRight aria-hidden className="size-4" />
          )}
        </button>
      </div>
      <p
        id={`${id}-status`}
        role="status"
        className={`text-xs ${status.type === "error" ? "text-red-400" : "text-muted"}`}
      >
        {status.type === "error"
          ? status.message
          : status.type === "done"
            ? `Pulled ${status.name}. Adjust anything below.`
            : "Fills in the name, logo, and main colour."}
      </p>
    </form>
  );
}
