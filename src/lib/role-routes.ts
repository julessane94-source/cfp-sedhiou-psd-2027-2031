export const roleRoutes: Record<string, string[]> = {
  DIRECTEUR: [
    "/dashboard", "/apprenants", "/candidature", "/formations", "/stages",
    "/insertion", "/entrepreneuriat", "/personnel", "/partenaires",
    "/communication", "/documents", "/notifications", "/audit",
    "/finances", "/finances/budgets", "/finances/operations", "/finances/caisse", "/infrastructures", "/securite",
    "/utilisateurs",
  ],
  GESTIONNAIRE: [
    "/dashboard", "/apprenants", "/candidature", "/formations", "/stages",
    "/insertion", "/entrepreneuriat", "/partenaires", "/communication",
    "/documents", "/notifications", "/finances", "/finances/budgets",
    "/finances/operations", "/finances/caisse",
    "/infrastructures",
  ],
  COMPTABLE_MATIERES: [
    "/dashboard", "/infrastructures", "/documents", "/notifications",
  ],
  CHEF_TRAVAUX: [
    "/dashboard", "/formations", "/apprenants", "/stages", "/infrastructures",
    "/documents", "/notifications",
  ],
  SURVEILLANT: [
    "/dashboard", "/apprenants", "/stages", "/notifications", "/securite",
  ],
  FORMATEUR: [
    "/dashboard", "/formations", "/apprenants", "/stages", "/documents",
  ],
  CELLULE_COM: ["/dashboard", "/communication", "/notifications"],
  CAI_INSERTION: ["/insertion"],
};

export function normalizeRole(role: string) {
  return role.toUpperCase().trim().replace(/\s+/g, "_");
}
