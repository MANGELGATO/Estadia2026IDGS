import React from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import styles from "./layout.module.css";
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
    <div className={styles.layout}>
      <AdminSidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
