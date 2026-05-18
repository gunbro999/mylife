"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  PenLine,
  StickyNote,
  BookText,
  Home,
  Heart,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  BarChart3,
  ScrollText,
  Bookmark,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/uiStore";
import { MiniPlayer } from "@/components/music/MiniPlayer";

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "归", sublabel: "首页" },
  { href: "/diary", icon: BookOpen, label: "记", sublabel: "日记" },
  { href: "/essays", icon: PenLine, label: "文", sublabel: "随笔" },
  { href: "/notes", icon: StickyNote, label: "念", sublabel: "小记" },
  { href: "/novels", icon: BookText, label: "著", sublabel: "小说" },
  { href: "/emotion", icon: Heart, label: "情", sublabel: "心情" },
  { href: "/timeline", icon: Clock, label: "溯", sublabel: "时间线" },
  { href: "/annual-report", icon: BarChart3, label: "览", sublabel: "年报" },
  { href: "/poetry", icon: ScrollText, label: "诗", sublabel: "赏诗" },
  { href: "/excerpts", icon: Bookmark, label: "摘", sublabel: "摘录" },
  { href: "/poetry-create", icon: Sparkles, label: "咏", sublabel: "赋诗" },
  { href: "/settings", icon: Settings, label: "设", sublabel: "设置" },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 200 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-bg-elevated border-r border-border"
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-border">
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.div
              key="seal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="seal-stamp text-sm"
            >
              记
            </motion.div>
          ) : (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5"
            >
              <span className="seal-stamp text-xs">记</span>
              <span className="font-display text-lg font-semibold tracking-widest text-text-primary">
                浮 生 记
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 group",
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-secondary",
                    collapsed && "justify-center px-0"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {collapsed ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <item.icon size={18} className="shrink-0" />
                      <span className="text-[10px] font-display">{item.label}</span>
                    </div>
                  ) : (
                    <>
                      <item.icon size={18} className="shrink-0" />
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="font-display text-xs text-text-tertiary">{item.label}</span>
                        <span className="font-medium">{item.sublabel}</span>
                      </div>
                    </>
                  )}

                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* MiniPlayer */}
      <MiniPlayer />

      {/* Collapse toggle */}
      <div className="border-t border-border p-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-text-tertiary transition-colors hover:bg-bg-secondary hover:text-text-secondary"
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="text-xs overflow-hidden whitespace-nowrap"
              >
                收起
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
