"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import type { BrandPull } from "@/lib/brand-pull/brand-pull-schema";
import {
  type BrandPullResult,
  requestBrandPull,
} from "@/lib/brand-pull/client";

import styles from "./brand-pull-form.module.css";

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
      className={styles.form}
    >
      <label htmlFor={id} className={styles.label}>
        Pull from a website
      </label>
      <div className={styles.row}>
        <input
          id={id}
          value={site}
          onChange={(event) => setSite(event.target.value)}
          placeholder="linear.app"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          aria-describedby={`${id}-status`}
          className={styles.input}
        />
        <button type="submit" disabled={loading} className={styles.submit}>
          {loading ? "Pulling…" : "Pull"}
          {loading ? (
            <LoaderCircle aria-hidden size={16} className={styles.spinner} />
          ) : (
            <ArrowRight aria-hidden size={16} />
          )}
        </button>
      </div>
      <p
        id={`${id}-status`}
        role="status"
        className={status.type === "error" ? styles.error : styles.status}
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
