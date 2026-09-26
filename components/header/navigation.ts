// Use existing product pages and homepage sections until category pages exist.
export const navigationItems = [
  { label: "Inicio", href: "/", current: true },
  { label: "Poloches", href: "/productos/poloch-basico-ara-lot" },
  { label: "Cuidado Personal", href: "/productos/shampoo-ara-lot" },
  { label: "Nueva Colección", href: "/#new-products" },
  { label: "Combos", href: "/#categories-title" },
  { label: "Ofertas", href: "/productos/poloch-premium-ara-lot" },
  { label: "Nosotros", href: "/#about" },
] as const;
