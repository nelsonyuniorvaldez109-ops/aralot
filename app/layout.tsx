import { CatalogProvider } from "@/components/product/CatalogProvider";
import { getProducts } from "@/lib/products/server";
import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AnnouncementBar } from "@/components/header/AnnouncementBar";
import { CartProvider } from "@/components/cart/CartProvider";
import { FavoritesProvider } from "@/components/favorites/FavoritesProvider";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { Header } from "@/components/header/Header";
import { StorefrontBoundary } from "./StorefrontBoundary";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "ARA LOT",
  description: "ARA LOT — tienda online para hombres.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const catalog = await getProducts();
  return (
    <html lang="es" className={manrope.variable}>
      <body>
        <CatalogProvider {...catalog}>
        <CartProvider>
          <FavoritesProvider>
            <StorefrontBoundary announcement={<AnnouncementBar />} header={<Header />} footer={<SiteFooter />}>
              {children}
            </StorefrontBoundary>
          </FavoritesProvider>
        </CartProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
