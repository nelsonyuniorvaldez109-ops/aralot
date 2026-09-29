import Link from "next/link";
import { CategoryForm } from "../CategoryForm";
import styles from "../../productos/products.module.css";

export const metadata = {
  title: "Nueva categoría | Administración ARA LOT",
};

export default function NewCategoryPage() {
  return (
    <main id="admin-content" className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p>CATÁLOGO</p>
          <h1>Nueva categoría</h1>
          <p>
            Agrega una nueva categoría para organizar los productos de la tienda.
          </p>
        </div>

        <Link href="/admin/categorias">
          Volver a categorías
        </Link>
      </header>

      <CategoryForm />
    </main>
  );
}