import { AuthGuard } from "@/components/layout/auth-guard";
import { Header } from "@/components/layout/header";
import { BottomTabs } from "@/components/layout/bottom-tabs";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-navy-950">
        <Header />
        <main className="mx-auto max-w-lg pb-20 px-4 py-4">
          {children}
        </main>
        <BottomTabs />
      </div>
    </AuthGuard>
  );
}
