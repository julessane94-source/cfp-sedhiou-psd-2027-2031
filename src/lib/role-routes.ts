export const roleRoutes: Record<string, string[]> = {
  DIRECTEUR: [
    "/dashboard", "/apprenants", "/candidature", "/formations", "/stages",
    "/insertion", "/entrepreneuriat", "/personnel", "/partenaires",
    "/communication", "/documents", "/notifications", "/audit",
    "/finances", "/infrastructures", "/securite",
  ],
  GESTIONNAIRE: [
    "/dashboard", "/apprenants", "/candidature", "/formations", "/stages",
    "/insertion", "/entrepreneuriat", "/partenaires", "/communication",
    "/documents", "/notifications", "/finances", "/infrastructures",
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
};

export function normalizeRole(role: string) {
  return role.toUpperCase().trim().replace(/\s+/g, "_");
}
