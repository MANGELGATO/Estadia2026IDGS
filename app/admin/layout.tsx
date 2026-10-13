import React from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | PLAi",
  description: "Panel de administración de recursos y aplicaciones",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-70px)] flex-col bg-[#F4F6F9] md:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
