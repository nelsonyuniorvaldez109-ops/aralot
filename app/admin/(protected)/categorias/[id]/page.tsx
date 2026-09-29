import Link from "next/link";
import { notFound } from "next/navigation";
import { productAccess } from "../../productos/access";
import { CategoryForm } from "../CategoryForm";
import styles from "../../productos/products.module.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
  sort_order: number;
};

export const metadata = {
  title: "Editar categoría | Administración ARA LOT",
};

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, allowed } = await productAccess();

  if (!allowed) {
    return (
      <main id="admin-content" className={styles.page}>
        <h1>Editar categoría</h1>

        <p role="alert">
          Tu cuenta no tiene permisos para gestionar categorías.
        </p>
      </main>
    );
  }

  const { data: category, error } = await supabase
    .from("categories")
    .select(
      "id,name,slug,description,image_url,active,sort_order"
    )
    .eq("id", id)
    .single<Category>();

  if (error || !category) {
    notFound();
  }

  return (
    <main id="admin-content" className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p>CATÁLOGO</p>
          <h1>Editar categoría</h1>
          <p>
            Modifica la información y la imagen de esta categoría.
          </p>
        </div>

        <Link href="/admin/categorias">
          Volver a categorías
        </Link>
      </header>

      <CategoryForm category={category} />
    </main>
  );
}