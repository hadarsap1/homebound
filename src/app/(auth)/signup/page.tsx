"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Step = "credentials" | "family";

export default function SignupPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  // Family step state
  const [familyMode, setFamilyMode] = useState<"create" | "join" | null>(null);
  const [familyName, setFamilyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("family");
  }

  async function handleCreateFamily(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: family, error: familyError } = await supabase
      .from("families")
      .insert({ name: familyName })
      .select()
      .single();

    if (familyError) {
      toast.error(familyError.message);
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
    setLoading(true);

    const { data: family, error: familyError } = await supabase
      .from("families")
      .select()
      .eq("invite_code", inviteCode.toUpperCase().trim())
      .single();

    if (familyError || !family) {
      toast.error("Invalid invite code. Please check and try again.");
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
              <Input
                label="Family Name"
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                required
                placeholder="e.g. The Sapirs"
              />
              <Button type="submit" disabled={loading} fullWidth>
                {loading ? "Creating..." : "Create Family"}
              </Button>
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
              <Input
                label="Invite Code"
                id="inviteCode"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                maxLength={8}
                className="text-center text-xl font-mono tracking-widest uppercase"
                placeholder="ABCD1234"
              />
              <Button type="submit" disabled={loading} fullWidth>
                {loading ? "Joining..." : "Join Family"}
              </Button>
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
          <Input
            label="Your Name"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            placeholder="Your name"
          />

          <Input
            label="Email"
            id="signupEmail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@email.com"
          />

          <Input
            label="Password"
            id="signupPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Min 6 characters"
          />

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
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
