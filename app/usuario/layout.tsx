import React from "react";
import UserSidebar from "../components/usuario/UserSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Panel | PLAi",
  description: "Panel de usuario para préstamos y agenda",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-70px)] flex-col bg-[#F4F6F9] md:flex-row">
      <UserSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
