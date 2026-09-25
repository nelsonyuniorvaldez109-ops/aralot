import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Hero } from "@/components/home/Hero";
import { NewProducts } from "@/components/home/NewProducts";
import { Newsletter } from "@/components/home/Newsletter";
import { PromotionalBanners } from "@/components/home/PromotionalBanners";

export default function Home() {
  return (
    <main id="storefront" tabIndex={-1}>
      <Hero imageAlt="Hombre con poloche negro y gafas de sol junto a productos de cuidado personal." />
      <CategoryGrid />
      <NewProducts />
      <PromotionalBanners />
      <Newsletter />
    </main>
  );
}
