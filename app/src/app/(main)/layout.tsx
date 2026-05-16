"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { AIPanel } from "@/components/ai/AIPanel";
import { MusicRecommendations } from "@/components/music/MusicRecommendations";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const aiPanelOpen = useUIStore((s) => s.aiPanelOpen);

  return (
    <div className="flex h-full ink-wash">
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-250",
          collapsed ? "ml-[72px]" : "ml-[200px]"
        )}
      >
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-auto paper-texture">{children}</main>
          <AIPanel />
        </div>
      </div>
      <MusicRecommendations />
    </div>
  );
}
