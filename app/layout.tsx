import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { AnnouncementBar } from "@/components/header/AnnouncementBar";
import { CartProvider } from "@/components/cart/CartProvider";
import { Header } from "@/components/header/Header";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "ARA LOT",
  description: "ARA LOT — tienda online para hombres.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={manrope.variable}>
      <body>
        <a className="skip-link" href="#storefront">Saltar al contenido</a>
        <AnnouncementBar />
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
