import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administración | ARA LOT",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
