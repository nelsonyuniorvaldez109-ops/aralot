export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "Poloches" | "Cuidado Personal";
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  colors?: string[];
  sizes?: string[];
  presentation?: string;
  badge?: string;
};

export const newProducts: Product[] = [
  {
    id: "poloch-basic",
    slug: "poloch-basico-ara-lot",
    name: "Poloch Básico ARA LOT",
    category: "Poloches",
    description:
      "Una pieza esencial de líneas limpias, creada para acompañar el estilo diario del hombre ARA LOT.",
    price: 1200,
    image: "/images/products/poloch-basic.webp",
    colors: ["Negro", "Blanco", "Gris"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: "poloch-premium",
    slug: "poloch-premium-ara-lot",
    name: "Poloch Premium ARA LOT",
    category: "Poloches",
    description:
      "Una propuesta refinada para vestir con presencia, comodidad y la identidad sobria de ARA LOT.",
    price: 1190,
    compareAtPrice: 1400,
    image: "/images/products/poloch-premium.webp",
    colors: ["Negro", "Blanco"],
    sizes: ["S", "M", "L", "XL"],
    badge: "-15%",
  },
  {
    id: "shampoo",
    slug: "shampoo-ara-lot",
    name: "Shampoo ARA LOT",
    category: "Cuidado Personal",
    description:
      "Una presentación práctica para integrar el cuidado personal a una rutina masculina sencilla.",
    price: 650,
    image: "/images/products/shampoo.webp",
    presentation: "400 ml",
  },
  {
    id: "gelatina",
    slug: "gelatina-ara-lot",
    name: "Gelatina ARA LOT",
    category: "Cuidado Personal",
    description:
      "Una opción de cuidado personal diseñada para complementar la rutina diaria del hombre ARA LOT.",
    price: 550,
    image: "/images/products/gelatina.webp",
    presentation: "300 ml",
  },
];
