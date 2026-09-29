import Link from "next/link";
import { productAccess } from "../productos/access";
import styles from "../productos/products.module.css";

export const metadata = {
  title: "Categorías | Administración ARA LOT",
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  active: boolean;
  sort_order: number;
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ resultado?: string }>;
}) {
  const { supabase, allowed } = await productAccess();
  const params = await searchParams;

  if (!allowed) {
    return (
      <main id="admin-content" className={styles.page}>
        <h1>Categorías</h1>
        <p role="alert">
          Tu cuenta no tiene permisos para gestionar categorías.
        </p>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("categories")
    .select(
      "id,name,slug,description,image_url,active,sort_order"
    )
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .returns<Category[]>();

  return (
    <main id="admin-content" className={styles.page}>
      <header className={styles.heading}>
        <div>
          <h1>Categorías</h1>
          <p>Organiza las categorías que aparecen en tu tienda.</p>
        </div>

        <Link
          className={styles.primary}
          href="/admin/categorias/nueva"
        >
          Nueva categoría
        </Link>
      </header>

      {params.resultado === "guardado" && (
        <p role="status" className={styles.notice}>
          Categoría guardada correctamente.
        </p>
      )}

      {error ? (
        <p className={styles.notice} role="alert">
          No fue posible cargar las categorías.
        </p>
      ) : (
        <div
          className={styles.tableWrap}
          tabIndex={0}
          role="region"
          aria-label="Listado de categorías"
        >
          <table className={styles.table}>
            <caption className={styles.caption}>
              {data?.length ?? 0} categorías
            </caption>

            <thead>
              <tr>
                <th scope="col">Categoría</th>
                <th scope="col">Descripción</th>
                <th scope="col">Orden</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {data?.map((category) => (
                <tr key={category.id}>
                  <th scope="row">{category.name}</th>

                  <td>
                    {category.description || "—"}
                  </td>

                  <td>{category.sort_order}</td>

                  <td>
                    <span className={styles.badge}>
                      {category.active ? "Activa" : "Inactiva"}
                    </span>
                  </td>

                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/admin/categorias/${category.id}`}
                        aria-label={`Editar ${category.name}`}
                      >
                        Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!data?.length && (
            <p className={styles.empty}>
              No hay categorías registradas.
            </p>
          )}
        </div>
      )}
    </main>
  );
}