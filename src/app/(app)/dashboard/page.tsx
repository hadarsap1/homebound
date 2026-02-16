"use client";

import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";
import { useProperties } from "@/hooks/use-properties";
import { useTasks } from "@/hooks/use-tasks";
import { Card } from "@/components/ui/card";
import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Home, Eye, Heart, FileText, CheckSquare, Plus } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const { data: properties, isLoading: propsLoading } = useProperties();
  const { data: tasks } = useTasks();

  const statusCounts = {
    new: properties?.filter((p) => p.status === "new").length || 0,
    visited: properties?.filter((p) => p.status === "visited").length || 0,
    interested: properties?.filter((p) => p.status === "interested").length || 0,
    total: properties?.length || 0,
  };

  const pendingTasks = tasks?.filter((t) => !t.completed) || [];
  const recentProperties = properties?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-navy-300">
          Hey {profile?.display_name || "there"} 👋
        </h1>
        <p className="text-sm text-navy-500 mt-1">Your home search at a glance</p>
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
