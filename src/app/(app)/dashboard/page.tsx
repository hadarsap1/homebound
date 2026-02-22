"use client";

import { useRouter } from "next/navigation";
import { useProfile, usePartner } from "@/hooks/use-profile";
import { useProperties } from "@/hooks/use-properties";
import { useTasks } from "@/hooks/use-tasks";
import { useFamilyRatings } from "@/hooks/use-ratings";
import { Card } from "@/components/ui/card";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Home, Eye, Heart, FileText, CheckSquare, Plus, AlertTriangle, Sparkles, Users } from "lucide-react";

const RATING_CATEGORIES = ["overall", "location", "condition", "value"] as const;

export default function DashboardPage() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: partner } = usePartner();
  const { data: properties, isLoading: propsLoading } = useProperties();
  const { data: tasks } = useTasks();
  const { data: allRatings } = useFamilyRatings();

  const statusCounts = {
    new: properties?.filter((p) => p.status === "new").length || 0,
    visited: properties?.filter((p) => p.status === "visited").length || 0,
    interested: properties?.filter((p) => p.status === "interested").length || 0,
    total: properties?.length || 0,
  };

  const pendingTasks = tasks?.filter((t) => !t.completed) || [];
  const recentProperties = properties?.slice(0, 5) || [];

  // Properties added in the last 48 hours
  const newProperties = (properties || []).filter((p) =>
    p.created_at && Date.now() - new Date(p.created_at).getTime() < 48 * 60 * 60 * 1000
  );

  // Disagreement highlights: properties where both partners rated and gap >= 2
  const disagreements: { propertyId: string; address: string; category: string; gap: number }[] = [];
  if (profile && partner && allRatings) {
    const byProperty = new Map<string, typeof allRatings>();
    for (const r of allRatings) {
      const list = byProperty.get(r.property_id) || [];
      list.push(r);
      byProperty.set(r.property_id, list);
    }
    for (const [propertyId, ratings] of byProperty) {
      const mine = ratings.find((r) => r.profile_id === profile.id);
      const theirs = ratings.find((r) => r.profile_id === partner.id);
      if (!mine || !theirs) continue;
      for (const cat of RATING_CATEGORIES) {
        const a = mine[cat] as number;
        const b = theirs[cat] as number;
        if (a && b && Math.abs(a - b) >= 2) {
          const prop = properties?.find((p) => p.id === propertyId);
          disagreements.push({
            propertyId,
            address: prop?.address || "Unknown",
            category: cat,
            gap: Math.abs(a - b),
          });
          break; // one disagreement per property is enough
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-300">
          Hey {profile?.display_name || "there"} 👋
        </h1>
        {partner ? (
          <p className="text-sm text-navy-500 mt-1">
            <Users size={12} className="inline mr-1" />
            Searching with {partner.display_name}
          </p>
        ) : (
          <p className="text-sm text-navy-500 mt-1">Your home search at a glance</p>
        )}
      </div>

      {/* Summary Cards */}
      {propsLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center">
            <Home size={20} className="mx-auto text-cyan-400" />
            <div className="text-2xl font-bold text-navy-300 mt-1">{statusCounts.total}</div>
            <div className="text-xs text-navy-500">Properties</div>
          </Card>
          <Card className="text-center">
            <Eye size={20} className="mx-auto text-amber-400" />
            <div className="text-2xl font-bold text-navy-300 mt-1">{statusCounts.visited}</div>
            <div className="text-xs text-navy-500">Visited</div>
          </Card>
          <Card className="text-center">
            <Heart size={20} className="mx-auto text-emerald-400" />
            <div className="text-2xl font-bold text-navy-300 mt-1">{statusCounts.interested}</div>
            <div className="text-xs text-navy-500">Interested</div>
          </Card>
          <Card className="text-center">
            <CheckSquare size={20} className="mx-auto text-rose-400" />
            <div className="text-2xl font-bold text-navy-300 mt-1">{pendingTasks.length}</div>
            <div className="text-xs text-navy-500">Open Tasks</div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button fullWidth onClick={() => router.push("/properties")}>
          <Plus size={16} className="mr-1" /> Add Property
        </Button>
        <Button variant="secondary" fullWidth onClick={() => router.push("/tasks")}>
          <FileText size={16} className="mr-1" /> Tasks
        </Button>
      </div>

      {/* What's New */}
      {newProperties.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-navy-300">What&apos;s New</h2>
          </div>
          <Card>
            <p className="text-sm text-navy-400">
              {newProperties.length} {newProperties.length === 1 ? "property" : "properties"} added in the last 48 hours
            </p>
            <div className="mt-2 space-y-1">
              {newProperties.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => router.push(`/properties/${p.id}`)}
                  className="block w-full text-left text-sm text-cyan-400 hover:text-cyan-300 truncate"
                >
                  {p.address}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Disagreements */}
      {disagreements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <h2 className="text-lg font-semibold text-navy-300">Worth Discussing</h2>
          </div>
          <div className="space-y-2">
            {disagreements.slice(0, 3).map((d) => (
              <Card
                key={d.propertyId}
                onClick={() => router.push(`/properties/${d.propertyId}`)}
              >
                <p className="text-sm text-navy-300 truncate">{d.address}</p>
                <p className="text-xs text-navy-500 mt-0.5">
                  {d.gap}-star gap on {d.category}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent Properties */}
      {recentProperties.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-navy-300">Recent</h2>
            <button
              onClick={() => router.push("/properties")}
              className="text-sm text-amber-500 hover:text-amber-400"
            >
              See all
            </button>
          </div>
          <div className="space-y-2">
            {recentProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => router.push(`/properties/${property.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-navy-300 mb-2">My Tasks</h2>
          <div className="space-y-1.5">
            {pendingTasks.slice(0, 5).map((task) => (
              <Card key={task.id} onClick={() => router.push("/tasks")} className="py-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded border border-navy-600" />
                  <span className="text-sm text-navy-300">{task.title}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
