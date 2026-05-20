'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/content', label: '内容管理', icon: FileText },
  { href: '/admin/stats', label: '数据统计', icon: BarChart3 },
  { href: '/admin/settings', label: '系统设置', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-border bg-bg-elevated">
      {/* Header */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white text-xs font-bold">
          M
        </div>
        <div>
          <p className="text-sm font-display font-bold text-text-primary tracking-wider">
            管理后台
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto p-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                  isActive
                    ? 'bg-accent text-white font-medium shadow-sm'
                    : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer - Back to main site */}
      <div className="border-t border-border p-3">
        <button
          onClick={() => router.push('/')}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-tertiary hover:bg-bg-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          返回主站
        </button>
      </div>
    </aside>
  );
}
