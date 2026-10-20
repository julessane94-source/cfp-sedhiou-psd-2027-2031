import type { LucideIcon } from "lucide-react";
import { normalizeRole, roleRoutes } from "@/lib/role-routes";
export { normalizeRole, roleRoutes } from "@/lib/role-routes";
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  BookOpenText,
  ClipboardCheck,
  CalendarDays,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  ShieldCheck,
  Users,
  Wallet,
  Handshake,
  UserRoundCog,
  UserSearch,
  UserCog,
} from "lucide-react";

export type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export const navigationGroups: MenuGroup[] = [
  {
    title: "Accueil",
    items: [{ label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Formation & insertion",
    items: [
      { label: "Apprenants", href: "/apprenants", icon: Users },
      { label: "Candidatures", href: "/candidature", icon: UserSearch },
      { label: "Formations", href: "/formations", icon: GraduationCap },
      { label: "Stages", href: "/stages", icon: BriefcaseBusiness },
      { label: "Insertion", href: "/insertion", icon: ClipboardCheck },
      { label: "Entrepreneuriat", href: "/entrepreneuriat", icon: Lightbulb },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Emplois du temps", href: "/planning", icon: CalendarDays },
      { label: "Demandes d’absence", href: "/absences", icon: ClipboardCheck },
      { label: "Personnel", href: "/personnel", icon: UserRoundCog },
      { label: "Partenaires", href: "/partenaires", icon: Handshake },
      { label: "Communication", href: "/communication", icon: Megaphone },
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Journal d’audit", href: "/audit", icon: ClipboardCheck },
      { label: "Utilisateurs", href: "/utilisateurs", icon: UserCog },
    ],
  },
  {
    title: "Gestion & contrôle",
    items: [
      { label: "Finances", href: "/finances", icon: Wallet },
      { label: "Registre de caisse", href: "/finances/caisse", icon: BookOpenText },
      { label: "Patrimoine", href: "/infrastructures", icon: Building2 },
      { label: "Sécurité", href: "/securite", icon: ShieldCheck },
    ],
  },
];

export function getVisibleMenuGroups(role: string) {
  const allowed = new Set(roleRoutes[normalizeRole(role)] ?? ["/dashboard"]);

  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => allowed.has(item.href)),
    }))
    .filter((group) => group.items.length > 0);
}

export function getVisibleMenuItems(role: string) {
  return getVisibleMenuGroups(role).flatMap((group) => group.items);
}
