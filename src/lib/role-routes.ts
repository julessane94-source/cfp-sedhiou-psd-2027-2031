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
    "/documents", "/notifications", "/planning", "/personnel",
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
  const normalized = role.toUpperCase().trim().replace(/\s+/g, "_");
  // Some accounts store the full label while route policy uses the short key.
  if (["CHEF_DES_TRAVAUX", "CHEF_DE_TRAVAUX"].includes(normalized)) {
    return "CHEF_TRAVAUX";
  }
  return normalized;
}
