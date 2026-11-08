"use client";

import { useState } from "react";
import {
  AlertCircle,
  Copy,
  Loader2,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Draft = {
  subject: string;
  greeting: string;
  body: string;
  closing: string;
  signature: string;
};

type Tone = "resmi" | "samimi" | "arkadasca";
type Lang = "tr" | "en";

const TONES: { value: Tone; label: string; icon: string }[] = [
  { value: "resmi", label: "Resmi", icon: "🎩" },
  { value: "samimi", label: "Samimi", icon: "😊" },
  { value: "arkadasca", label: "Arkadaşça", icon: "🙌" },
];

const EXAMPLE = {
  topic: "Toplantı ertelenmesi talebi",
  recipient: "Müdürüm Ayşe Yıldız",
  points:
    "Yarın saat 14:00'teki toplantıyı, acil bir müşteri ziyareti nedeniyle öğleden sonraya veya ertesi güne alabilir miyiz? Tarih önerisi sunacağım.",
};

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-navy/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-turquoise focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-turquoise dark:text-brand-navy";
const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white/70 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm backdrop-blur transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900";
const CARD =
  "rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60";
const MUTED = "text-slate-500 dark:text-slate-400";

export function EpostaApp() {
  const [topic, setTopic] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<Tone>("resmi");
  const [language, setLanguage] = useState<Lang>("tr");
  const [points, setPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  async function run() {
    if (topic.trim().length < 3) {
      setError("Konu en az 3 karakter olmalı.");
      return;
    }
    if (recipient.trim().length < 1) {
      setError("Alıcı belirt.");
      return;
    }
    setLoading(true);
    setError(null);
    setDraft(null);
    try {
      const r = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, recipient, tone, language, points }),
      });
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "Bilinmeyen hata.");
      else setDraft(data as Draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ağ hatası.");
    } finally {
      setLoading(false);
    }
  }

  function fullText(): string {
    if (!draft) return "";
    return `Konu: ${draft.subject}\n\n${draft.greeting}\n\n${draft.body}\n\n${draft.closing}\n${draft.signature}`;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-2">
        <div className={CARD}>
          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Mail className="size-4 text-brand-turquoise" />
              E-posta bilgileri
            </h2>
          </div>
          <div className="space-y-4 p-5">
            <Field label="Konu">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="örn. Toplantı ertelenmesi talebi"
                className={inputCls}
              />
            </Field>
            <Field label="Alıcı">
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="örn. Müdürüm Ayşe Yıldız"
                className={inputCls}
              />
            </Field>
            <Field label="Ton">
              <div className="grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition",
                      tone === t.value
                        ? "border-brand-navy bg-brand-navy/5 text-slate-900 dark:border-brand-turquoise dark:bg-brand-turquoise/10 dark:text-slate-100"
                        : "border-slate-300 bg-white/50 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300",
                    )}
                  >
                    <span className="mr-1">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Dil">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Lang)}
                className={inputCls}
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </Field>
            <Field label="Değinilecek noktalar (opsiyonel)">
              <textarea
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="E-postada mutlaka geçmesi gerekenleri yaz."
                className={cn(inputCls, "h-24 resize-y")}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={run}
                disabled={loading}
                className={BTN_PRIMARY}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Yazılıyor…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    Taslağı üret
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTopic(EXAMPLE.topic);
                  setRecipient(EXAMPLE.recipient);
                  setPoints(EXAMPLE.points);
                }}
                disabled={loading}
                className={BTN_OUTLINE}
              >
                Örnek doldur
              </button>
            </div>
            <p className={cn("text-[11px]", MUTED)}>
              Saatte 30 taslak sınırı var.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-3">
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-200"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        ) : null}
        {!draft && !loading && !error ? (
          <div
            className={cn(
              CARD,
              "flex flex-col items-center gap-3 border-dashed py-14 text-center",
            )}
          >
            <Send className="size-10 text-brand-turquoise" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Hazır olduğunda taslağı üret
            </h3>
            <p className={cn("max-w-sm text-sm", MUTED)}>
              Konu, alıcı ve ton bilgisini gir. Yapay zekâ konu satırı, selamlama,
              gövde, kapanış ve imza alanlı taslak hazırlar.
            </p>
          </div>
        ) : null}
        {loading ? (
          <div
            className={cn(
              CARD,
              "flex flex-col items-center gap-3 py-14 text-center",
            )}
          >
            <Loader2 className="size-10 animate-spin text-brand-turquoise" />
            <p className={cn("text-sm", MUTED)}>Yazılıyor… 5-15 saniye.</p>
          </div>
        ) : null}
        {draft ? (
          <>
            <div className={cn(CARD, "p-5")}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className={cn("text-xs uppercase tracking-widest", MUTED)}>
                  Konu
                </p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(fullText())}
                  className="inline-flex items-center gap-1 text-xs text-brand-turquoise hover:underline"
                >
                  <Copy className="size-3.5" />
                  Hepsini kopyala
                </button>
              </div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {draft.subject}
              </p>
            </div>
            <div className={cn(CARD, "p-5")}>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
                {draft.greeting}
                {"\n\n"}
                {draft.body}
                {"\n\n"}
                {draft.closing}
                {"\n"}
                {draft.signature}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

const inputCls =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-inner outline-none focus:border-brand-turquoise focus:ring-2 focus:ring-brand-turquoise/30 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={cn("mb-1.5 block text-xs font-semibold uppercase tracking-wider", MUTED)}>
        {label}
      </label>
      {children}
    </div>
  );
}
