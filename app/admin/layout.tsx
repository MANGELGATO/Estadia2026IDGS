import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';
import AdminSidebar from '../components/admin/AdminSidebar';
import { authOptions } from '../../lib/auth';

export const metadata: Metadata = {
  title: 'Panel de Administración | PLAi',
  description: 'Panel de administración de recursos, inventario, reservaciones y aplicaciones de PLAi',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (session.user.role !== 'admin' && session.user.role !== 'colaborador') {
    redirect('/usuario');
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F6F9] md:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
