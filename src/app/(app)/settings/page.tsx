"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useProfile } from "@/hooks/use-profile";
import { useFamilySettings, useUpdateFamilySettings } from "@/hooks/use-family-settings";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { CustomFieldCreator } from "@/components/forms/custom-field-creator";
import { LogOut, Copy, Share2, Plus, X, Settings2, Users, Tag, Columns3 } from "lucide-react";
import { toast } from "sonner";
import type { CustomFieldDefinition } from "@/lib/supabase/types";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const { data: profile } = useProfile();
  const { data: settings } = useFamilySettings();
  const updateSettings = useUpdateFamilySettings();

  const { data: family } = useQuery({
    queryKey: ["family", profile?.family_id],
    queryFn: async () => {
      if (!profile?.family_id) return null;
      const { data, error } = await supabase
        .from("families")
        .select("invite_code")
        .eq("id", profile.family_id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!profile?.family_id,
  });

  const [newTag, setNewTag] = useState("");
  const [showFieldCreator, setShowFieldCreator] = useState(false);
  const [removeTagIndex, setRemoveTagIndex] = useState<number | null>(null);
  const [removeFieldIndex, setRemoveFieldIndex] = useState<number | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
  }

  async function shareInviteCode() {
    if (!family?.invite_code) return;
    const text = `Join my family on HomeBound! Use invite code: ${family.invite_code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "HomeBound Invite", text });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    navigator.clipboard.writeText(family.invite_code);
    toast.success("Copied!");
  }

  async function addTag() {
    if (!newTag.trim() || !settings) return;
    const tags = [...(settings.custom_tags || []), newTag.trim()];
    await updateSettings.mutateAsync({ custom_tags: tags });
    setNewTag("");
  }

  async function removeTag(index: number) {
    if (!settings) return;
    const tags = (settings.custom_tags || []).filter((_: string, i: number) => i !== index);
    await updateSettings.mutateAsync({ custom_tags: tags });
  }

  async function addField(field: CustomFieldDefinition) {
    if (!settings) return;
    const fields = [...(settings.custom_field_definitions || []), field];
    await updateSettings.mutateAsync({ custom_field_definitions: fields });
    setShowFieldCreator(false);
  }

  async function removeField(index: number) {
    if (!settings) return;
    const fields = (settings.custom_field_definitions || []).filter(
      (_: CustomFieldDefinition, i: number) => i !== index
    );
    await updateSettings.mutateAsync({ custom_field_definitions: fields });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-navy-300">Settings</h1>

      {/* Profile */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-navy-500">
          <Settings2 size={16} />
          <h2 className="text-sm font-medium">Profile</h2>
        </div>
        <Card>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500 flex items-center justify-center text-navy-950 font-bold">
              {profile?.display_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-medium text-navy-300">
                {profile?.display_name || "No name set"}
              </p>
              <p className="text-xs text-navy-500">{profile?.email}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Family */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-navy-500">
          <Users size={16} />
          <h2 className="text-sm font-medium">Family</h2>
        </div>
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-navy-400">Invite Code</span>
              <span className="font-mono text-sm text-navy-300">
                {family?.invite_code || "—"}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={shareInviteCode}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-navy-950 hover:bg-amber-400"
              >
                <Share2 size={14} /> Share
              </button>
              <button
                onClick={() => {
                  if (!family?.invite_code) return;
                  navigator.clipboard.writeText(family.invite_code);
                  toast.success("Copied!");
                }}
                className="flex items-center gap-1.5 rounded-lg bg-navy-700 px-3 py-2 text-sm text-navy-300 hover:bg-navy-600"
              >
                <Copy size={14} /> Copy
              </button>
            </div>
          </div>
        </Card>
      </section>

      {/* Vibe Tags */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-navy-500">
          <Tag size={16} />
          <h2 className="text-sm font-medium">Vibe Tags</h2>
        </div>
        <Card>
          <div className="flex flex-wrap gap-2 mb-3">
            {(settings?.custom_tags || []).map((tag: string, i: number) => (
              <Badge key={i} variant="tag">
                {tag}
                <button
                  onClick={() => setRemoveTagIndex(i)}
                  aria-label={`Remove tag: ${tag}`}
                  className="ml-1 hover:text-rose-400"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button variant="secondary" onClick={addTag} aria-label="Add tag">
              <Plus size={16} aria-hidden="true" />
            </Button>
          </div>
        </Card>
      </section>

      {/* Custom Fields */}
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-navy-500">
          <Columns3 size={16} />
          <h2 className="text-sm font-medium">Custom Fields</h2>
        </div>
        <Card>
          {(settings?.custom_field_definitions || []).length > 0 ? (
            <div className="space-y-2 mb-3">
              {(settings?.custom_field_definitions || []).map(
                (field: CustomFieldDefinition, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg bg-navy-800 px-3 py-2"
                  >
                    <div>
                      <span className="text-sm text-navy-300">{field.label}</span>
                      <span className="ml-2 text-xs text-navy-600">{field.type}</span>
                    </div>
                    <button
                      onClick={() => setRemoveFieldIndex(i)}
                      aria-label={`Remove field: ${field.label}`}
                      className="text-navy-600 hover:text-rose-400"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-sm text-navy-600 mb-3">
              No custom fields yet. Add fields that appear on all properties.
            </p>
          )}
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowFieldCreator(true)}
          >
            <Plus size={16} className="mr-1" /> Add Custom Field
          </Button>
        </Card>
      </section>

      {/* Sign Out */}
      <Button variant="danger" fullWidth onClick={() => setShowSignOutConfirm(true)}>
        <LogOut size={16} className="mr-1" /> Sign Out
      </Button>

      <BottomSheet
        open={showFieldCreator}
        onClose={() => setShowFieldCreator(false)}
        title="New Custom Field"
      >
        <CustomFieldCreator onAdd={addField} />
      </BottomSheet>

      <ConfirmModal
        open={removeTagIndex !== null}
        onClose={() => setRemoveTagIndex(null)}
        title="Remove Tag"
        message="Remove this vibe tag?"
        confirmLabel="Remove"
        onConfirm={() => {
          if (removeTagIndex !== null) removeTag(removeTagIndex);
          setRemoveTagIndex(null);
        }}
      />

      <ConfirmModal
        open={removeFieldIndex !== null}
        onClose={() => setRemoveFieldIndex(null)}
        title="Remove Custom Field"
        message="Remove this custom field? Data on existing properties will not be deleted."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => {
          if (removeFieldIndex !== null) removeField(removeFieldIndex);
          setRemoveFieldIndex(null);
        }}
      />

      <ConfirmModal
        open={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        onConfirm={handleSignOut}
      />
    </div>
  );
}
