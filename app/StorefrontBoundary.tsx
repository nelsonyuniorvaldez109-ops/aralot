"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  announcement: ReactNode;
  header: ReactNode;
  footer: ReactNode;
};

export function StorefrontBoundary({ children, announcement, header, footer }: Props) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return children;
  return (
    <>
      <a className="skip-link" href="#storefront">Saltar al contenido</a>
      {announcement}
      {header}
      {children}
      {footer}
    </>
  );
}
