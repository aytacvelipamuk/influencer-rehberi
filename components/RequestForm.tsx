"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";

export interface Field {
  name: string;
  label: string;
  type?: "text" | "email" | "url" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: [string, string][];
}

interface Props {
  endpoint: string;
  fields: Field[];
  submitLabel: string;
  success: { title: string; body: string };
  consents?: { name: string; label: React.ReactNode; required?: boolean }[];
}

const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;
const input = "w-full rounded-lg border border-line bg-paper px-4 text-base text-ink placeholder:text-faint transition-colors focus:border-pink";

export function RequestForm({ endpoint, fields, submitLabel, success, consents = [] }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body: Record<string, unknown> = Object.fromEntries(form.entries());
    for (const c of consents) body[c.name] = form.get(c.name) === "on";
    // Hangi kanal talep getirdi: sayfa adresindeki UTM değerleri talebe eklenir (sunucu doğrular).
    const utm = new URLSearchParams(window.location.search);
    for (const k of ["utm_source", "utm_medium", "utm_campaign"]) if (utm.get(k)) body[k] = utm.get(k);
    setState("sending");
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) return setState("done");
      setError({ text: data.error ?? "Bir sorun oluştu.", field: data.field });
    } catch {
      setError({ text: "Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene." });
    }
    setState("idle");
  }

  return (
    <AnimatePresence mode="wait">
      {state === "done" ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_CUBIC }}
          className="rounded-xl bg-blush p-8 text-center"
          role="status"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
            className="mx-auto grid size-14 place-items-center rounded-full bg-pink text-2xl text-white"
          >
            ✓
          </motion.span>
          <h2 className="mt-5 font-serif text-3xl">{success.title}</h2>
          <p className="mt-2 text-ink-2">{success.body}</p>
          <Link href="/#rehber" className="underline-grow mt-6 inline-block font-medium">Rehbere dön</Link>
        </motion.div>
      ) : (
        <motion.form key="form" exit={{ opacity: 0, y: -12 }} onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
          {fields.map((f) => (
            <label key={f.name} className="flex flex-col gap-2">
              <span className="text-[0.95rem] font-medium">{f.label}</span>
              {f.type === "textarea" ? (
                <textarea name={f.name} placeholder={f.placeholder} rows={3} maxLength={500} className={`${input} py-3`} />
              ) : f.type === "select" ? (
                <select name={f.name} className={`${input} h-13`}>
                  {f.options?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              ) : (
                <input
                  name={f.name}
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  required={f.required}
                  aria-invalid={error?.field === f.name}
                  className={`${input} h-13 ${error?.field === f.name ? "border-pink" : ""}`}
                />
              )}
            </label>
          ))}
          {/* bal tuzağı: insanlar görmez */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          {consents.map((c) => (
            <label key={c.name} className="flex items-start gap-3 text-sm text-ink-2">
              <input type="checkbox" name={c.name} className="mt-0.5 size-4 accent-[var(--color-pink)]" />
              <span>{c.label}</span>
            </label>
          ))}
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-lg bg-pink-soft px-4 py-3 text-sm text-pink-dark" role="alert">
                {error.text}
              </motion.p>
            )}
          </AnimatePresence>
          <button
            type="submit"
            disabled={state === "sending"}
            className="h-14 rounded-full bg-pink px-8 text-base font-medium text-white transition-colors hover:bg-pink-dark disabled:opacity-60"
          >
            {state === "sending" ? "Gönderiliyor…" : submitLabel}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
