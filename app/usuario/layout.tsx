import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import type { Metadata } from 'next';
import UserSidebar from '../components/usuario/UserSidebar';
import { authOptions } from '../../lib/auth';

export const metadata: Metadata = {
  title: 'Portal de Usuario | PLAi Jalisco',
  description: 'Panel de usuario para gestión de préstamos, reservaciones y agenda',
};

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/usuario');
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F6F9] md:flex-row">
      <UserSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
