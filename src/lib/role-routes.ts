export const roleRoutes: Record<string, string[]> = {
  DIRECTEUR: [
    "/dashboard", "/apprenants", "/candidature", "/formations", "/stages",
    "/insertion", "/entrepreneuriat", "/personnel", "/partenaires",
    "/communication", "/documents", "/notifications", "/audit",
    "/finances", "/finances/budgets", "/finances/operations", "/finances/caisse", "/infrastructures", "/securite",
    "/utilisateurs", "/planning", "/absences",
  ],
  GESTIONNAIRE: [
    "/dashboard", "/apprenants", "/candidature", "/formations", "/personnel", "/stages",
    "/insertion", "/entrepreneuriat", "/partenaires", "/communication", "/documents", "/notifications",
    "/finances", "/finances/budgets", "/finances/operations", "/finances/caisse", "/infrastructures",
  ],
  COMPTABLE_MATIERES: [
    "/dashboard", "/infrastructures",
  ],
  CHEF_TRAVAUX: [
    "/dashboard", "/formations", "/apprenants", "/stages", "/infrastructures",
    "/documents", "/notifications", "/planning",
  ],
  SURVEILLANT: [
    "/dashboard", "/apprenants", "/stages", "/notifications", "/securite",
  ],
  FORMATEUR: [
    "/dashboard", "/documents", "/absences",
  ],
  CELLULE_COM: ["/dashboard", "/communication", "/notifications"],
  CAI_INSERTION: ["/insertion"],
};

export function normalizeRole(role: string) {
  return role.toUpperCase().trim().replace(/\s+/g, "_");
}
