'use client';

import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-bg-primary">
        {children}
      </main>
    </div>
  );
}
