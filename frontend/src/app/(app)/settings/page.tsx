"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearAuth, getAuthUser, trialDaysRemaining, type AuthUser } from "@/lib/auth";

interface MeResponse {
  user_id: string;
  email: string;
  plan: string;
  is_admin: boolean;
  trial_ends_at: string | null;
  default_tone: string;
  signature: string | null;
  followup_default_days: number;
  openai_api_key_hint: string | null;
}

const TONES = ["professional", "friendly", "concise", "formal"] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "rgba(255,255,255,0.025)" }}>
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      <div className="px-6 py-5 flex flex-col gap-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
      <div className="sm:w-48 flex-shrink-0 pt-0.5">
        <p className="text-white/70 text-sm font-medium">{label}</p>
        {hint && <p className="text-white/25 text-xs mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [me,          setMe]          = useState<MeResponse | null>(null);
  const [localUser,   setLocalUser]   = useState<AuthUser | null>(null);

  // Preferences form
  const [tone,           setTone]           = useState("professional");
  const [signature,      setSignature]      = useState("");
  const [followupDays,   setFollowupDays]   = useState(3);
  const [prefSaving,     setPrefSaving]     = useState(false);
  const [prefSaved,      setPrefSaved]      = useState(false);

  // AI key form
  const [aiKey,      setAiKey]      = useState("");
  const [aiSaving,   setAiSaving]   = useState(false);
  const [aiSaved,    setAiSaved]    = useState(false);
  const [aiError,    setAiError]    = useState<string | null>(null);

  // Password form
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [pwSaving,   setPwSaving]   = useState(false);
  const [pwError,    setPwError]    = useState<string | null>(null);
  const [pwSaved,    setPwSaved]    = useState(false);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting,      setDeleting]      = useState(false);
  const [deleteError,   setDeleteError]   = useState<string | null>(null);

  useEffect(() => {
    setLocalUser(getAuthUser());
    api.get<MeResponse>("/api/auth/me").then((data) => {
      setMe(data);
      setTone(data.default_tone ?? "professional");
      setSignature(data.signature ?? "");
      setFollowupDays(data.followup_default_days ?? 3);
    });
  }, []);

  async function savePreferences(e: FormEvent) {
    e.preventDefault();
    setPrefSaving(true);
    try {
      await api.patch("/api/auth/me", { default_tone: tone, signature, followup_default_days: followupDays });
      setPrefSaved(true);
      setTimeout(() => setPrefSaved(false), 2500);
    } finally {
      setPrefSaving(false);
    }
  }

  async function saveAiKey(e: FormEvent) {
    e.preventDefault();
    setAiError(null);
    setAiSaving(true);
    try {
      await api.patch("/api/auth/me", { openai_api_key: aiKey });
      setAiSaved(true);
      setAiKey("");
      setMe((prev) => prev ? { ...prev, openai_api_key_hint: aiKey === "" ? null : `...${aiKey.slice(-4)}` } : prev);
      setTimeout(() => setAiSaved(false), 2500);
    } catch (err) {
      setAiError((err as Error).message);
    } finally {
      setAiSaving(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters"); return; }
    setPwSaving(true);
    try {
      await api.patch("/api/auth/me", { current_password: currentPw, new_password: newPw });
      setPwSaved(true);
      setCurrentPw(""); setNewPw("");
      setTimeout(() => setPwSaved(false), 2500);
    } catch (err) {
      setPwError((err as Error).message);
    } finally {
      setPwSaving(false);
    }
  }

  async function deleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete("/api/auth/me");
      clearAuth();
      router.push("/");
    } catch (err) {
      setDeleteError((err as Error).message);
      setDeleting(false);
    }
  }

  const daysLeft = localUser ? trialDaysRemaining(localUser) : null;

  const planBadge = me?.is_admin
    ? { label: "Admin", color: "#06b6d4" }
    : me?.plan !== "free"
    ? { label: me?.plan ?? "Free", color: "#34d399" }
    : daysLeft !== null && daysLeft > 0
    ? { label: `${daysLeft}d trial`, color: "#f59e0b" }
    : { label: "Free", color: "rgba(255,255,255,0.3)" };

  return (
    <div className="px-8 py-10 max-w-2xl mx-auto w-full">

      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-white/40 text-sm">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col gap-6">

        {/* ── Account ── */}
        <Section title="Account">
          <Field label="Email address" hint="Used to sign in — cannot be changed">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03]">
              <span className="text-white/50 text-sm">{me?.email ?? "…"}</span>
            </div>
          </Field>

          <Field label="Plan">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize"
                style={{ background: `${planBadge.color}18`, color: planBadge.color, border: `1px solid ${planBadge.color}30` }}
              >
                {planBadge.label}
              </span>
              {!me?.is_admin && me?.plan === "free" && (
                <a href="/#pricing" className="text-brand text-xs hover:underline">Upgrade →</a>
              )}
            </div>
          </Field>

          {daysLeft !== null && daysLeft > 0 && (
            <Field label="Trial expires">
              <p className="text-amber-400 text-sm">
                {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
                {me?.trial_ends_at && (
                  <span className="text-white/30 ml-2">
                    ({new Date(me.trial_ends_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })})
                  </span>
                )}
              </p>
            </Field>
          )}
        </Section>

        {/* ── Preferences ── */}
        <Section title="Preferences">
          <form onSubmit={savePreferences} className="flex flex-col gap-5">
            <Field label="Default tone" hint="Used when generating AI reply drafts">
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-150 border ${
                      tone === t
                        ? "bg-brand/15 border-brand/30 text-brand"
                        : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.07]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Follow-up default" hint="Days before suggesting a follow-up">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={followupDays}
                  onChange={(e) => setFollowupDays(Number(e.target.value))}
                  className="w-20 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white text-sm outline-none focus:border-brand/40 transition-colors"
                />
                <span className="text-white/30 text-sm">days</span>
              </div>
            </Field>

            <Field label="Email signature" hint="Appended to AI-generated replies">
              <textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                rows={4}
                placeholder="e.g. Best regards,&#10;Your Name"
                className="w-full px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/70 text-sm placeholder-white/20 outline-none resize-none focus:border-brand/40 transition-colors"
              />
            </Field>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={prefSaving}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${
                  prefSaved
                    ? "bg-emerald/20 border border-emerald/30 text-emerald"
                    : "bg-gradient-brand hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:scale-105"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {prefSaved ? (
                  <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Saved</>
                ) : prefSaving ? "Saving…" : "Save preferences"}
              </button>
            </div>
          </form>
        </Section>

        {/* ── AI ── */}
        <Section title="AI Provider">
          <form onSubmit={saveAiKey} className="flex flex-col gap-5">
            <Field
              label="OpenAI API key"
              hint={me?.openai_api_key_hint
                ? `Current key: ${me.openai_api_key_hint} — paste a new key to replace, or clear to remove`
                : "Required to analyse threads. Get yours at platform.openai.com"}
            >
              <div className="flex gap-2">
                <input
                  type="password"
                  value={aiKey}
                  onChange={(e) => setAiKey(e.target.value)}
                  placeholder={me?.openai_api_key_hint ? me.openai_api_key_hint : "sk-..."}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white text-sm outline-none focus:border-brand/40 transition-colors placeholder-white/20"
                />
                {me?.openai_api_key_hint && (
                  <button
                    type="button"
                    onClick={async () => {
                      await api.patch("/api/auth/me", { openai_api_key: "" });
                      setMe((prev) => prev ? { ...prev, openai_api_key_hint: null } : prev);
                    }}
                    className="px-3 py-2.5 rounded-xl text-xs font-medium text-red-400 border border-red-500/20 bg-red-500/[0.06] hover:bg-red-500/[0.12] transition-all duration-150"
                  >
                    Remove
                  </button>
                )}
              </div>
              {aiError && (
                <p className="text-red-400 text-xs mt-2 px-3 py-2 rounded-lg bg-red-500/[0.08] border border-red-500/20">{aiError}</p>
              )}
            </Field>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={aiSaving || !aiKey}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${
                  aiSaved
                    ? "bg-emerald/20 border border-emerald/30 text-emerald"
                    : "bg-gradient-brand hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:scale-105"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {aiSaved ? (
                  <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Saved</>
                ) : aiSaving ? "Saving…" : "Save key"}
              </button>
            </div>
          </form>
        </Section>

        {/* ── Security ── */}
        <Section title="Security">
          <form onSubmit={changePassword} className="flex flex-col gap-5">
            <Field label="Current password">
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white text-sm outline-none focus:border-brand/40 transition-colors"
                placeholder="••••••••"
              />
            </Field>

            <Field label="New password" hint="Minimum 8 characters">
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                required
                minLength={8}
                className="w-full px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white text-sm outline-none focus:border-brand/40 transition-colors"
                placeholder="••••••••"
              />
            </Field>

            {pwError && (
              <p className="text-red-400 text-xs px-3 py-2 rounded-lg bg-red-500/[0.08] border border-red-500/20">{pwError}</p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={pwSaving || !currentPw || !newPw}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 ${
                  pwSaved
                    ? "bg-emerald/20 border border-emerald/30 text-emerald"
                    : "bg-gradient-brand hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:scale-105"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {pwSaved ? (
                  <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Password updated</>
                ) : pwSaving ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </Section>

        {/* ── Danger zone ── */}
        <div className="rounded-2xl border border-red-500/20 overflow-hidden" style={{ background: "rgba(239,68,68,0.03)" }}>
          <div className="px-6 py-4 border-b border-red-500/15">
            <h2 className="text-red-400 font-semibold text-sm">Danger zone</h2>
          </div>
          <div className="px-6 py-5">
            <Field label="Delete account" hint="This permanently deletes your account and all data. Cannot be undone.">
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  placeholder='Type "DELETE" to confirm'
                  className="w-full px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.05] text-white text-sm outline-none focus:border-red-500/40 transition-colors placeholder-white/20"
                />
                {deleteError && (
                  <p className="text-red-400 text-xs">{deleteError}</p>
                )}
                <button
                  onClick={deleteAccount}
                  disabled={deleteConfirm !== "DELETE" || deleting}
                  className="w-fit px-5 py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/25 bg-red-500/[0.08] hover:bg-red-500/[0.15] hover:border-red-500/40 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {deleting ? "Deleting…" : "Delete my account"}
                </button>
              </div>
            </Field>
          </div>
        </div>

      </div>
    </div>
  );
}
