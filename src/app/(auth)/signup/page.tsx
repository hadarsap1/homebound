"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabase } from "@/components/providers/supabase-provider";

type Step = "credentials" | "family";

export default function SignupPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Family step state
  const [familyMode, setFamilyMode] = useState<"create" | "join" | null>(null);
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("family");
  }

  async function handleCreateFamily(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: family, error: familyError } = await supabase
      .from("families")
      .insert({ name: familyName })
      .select()
      .single();

    if (familyError) {
      setError(familyError.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ family_id: family.id, display_name: displayName })
        .eq("id", user.id);
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleJoinFamily(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: family, error: familyError } = await supabase
      .from("families")
      .select()
      .eq("invite_code", inviteCode.toUpperCase().trim())
      .single();

    if (familyError || !family) {
      setError("Invalid invite code. Please check and try again.");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ family_id: family.id, display_name: displayName })
        .eq("id", user.id);
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (step === "family") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-amber-500">HomeBound</h1>
            <p className="mt-2 text-navy-500">Set up your family workspace</p>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          {!familyMode && (
            <div className="space-y-3">
              <button
                onClick={() => setFamilyMode("create")}
                className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-4 text-left transition-colors hover:border-amber-500"
              >
                <div className="font-semibold text-navy-300">Create Family</div>
                <div className="mt-1 text-sm text-navy-500">
                  Start a new workspace and invite your partner
                </div>
              </button>
              <button
                onClick={() => setFamilyMode("join")}
                className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-4 text-left transition-colors hover:border-amber-500"
              >
                <div className="font-semibold text-navy-300">Join Family</div>
                <div className="mt-1 text-sm text-navy-500">
                  Enter an invite code from your partner
                </div>
              </button>
            </div>
          )}

          {familyMode === "create" && (
            <form onSubmit={handleCreateFamily} className="space-y-4">
              <div>
                <label htmlFor="familyName" className="block text-sm font-medium text-navy-400">
                  Family Name
                </label>
                <input
                  id="familyName"
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-3 text-navy-300 placeholder-navy-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="e.g. The Sapirs"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-navy-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Family"}
              </button>
              <button
                type="button"
                onClick={() => setFamilyMode(null)}
                className="w-full py-2 text-sm text-navy-500 hover:text-navy-400"
              >
                Back
              </button>
            </form>
          )}

          {familyMode === "join" && (
            <form onSubmit={handleJoinFamily} className="space-y-4">
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-navy-400">
                  Invite Code
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  required
                  maxLength={8}
                  className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-3 text-center text-xl font-mono tracking-widest text-navy-300 uppercase placeholder-navy-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="ABCD1234"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-navy-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join Family"}
              </button>
              <button
                type="button"
                onClick={() => setFamilyMode(null)}
                className="w-full py-2 text-sm text-navy-500 hover:text-navy-400"
              >
                Back
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-500">HomeBound</h1>
          <p className="mt-2 text-navy-500">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-navy-400">
              Your Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-3 text-navy-300 placeholder-navy-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="signupEmail" className="block text-sm font-medium text-navy-400">
              Email
            </label>
            <input
              id="signupEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-3 text-navy-300 placeholder-navy-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label htmlFor="signupPassword" className="block text-sm font-medium text-navy-400">
              Password
            </label>
            <input
              id="signupPassword"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-3 text-navy-300 placeholder-navy-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="Min 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-navy-950 transition-colors hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-navy-500">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-500 hover:text-amber-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
