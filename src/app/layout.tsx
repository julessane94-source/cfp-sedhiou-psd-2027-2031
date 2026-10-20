import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: {
    default: "CFP Sédhiou | Plateforme de gestion",
    template: "%s | CFP Sédhiou",
  },
  description:
    "Plateforme de gestion administrative, pédagogique et financière du CFP Sédhiou.",
};

// Les vues consultent les données opérationnelles de PostgreSQL à chaque requête.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body><AppShell>{children}</AppShell></body>
    </html>
  );
}
