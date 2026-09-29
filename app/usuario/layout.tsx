import React from "react";
import UserSidebar from "../components/usuario/UserSidebar";
import styles from "./layout.module.css";
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
    <div className={styles.layout}>
      <UserSidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
