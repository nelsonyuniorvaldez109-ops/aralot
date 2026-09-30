export const navigationItems = [
  { label: "Inicio", href: "/", current: true },
  { label: "Poloches", href: "/productos?categoria=poloches" },
  { label: "Cuidado Personal", href: "/productos?categoria=cuidado-personal" },
  { label: "Nueva Colección", href: "/productos?categoria=nueva-coleccion" },
  { label: "Combos", href: "/productos?categoria=combos" },
  { label: "Ofertas", href: "/#new-products" },
  { label: "Nosotros", href: "/#about" },
] as const;