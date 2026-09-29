import Link from "next/link";
import { productAccess } from "./access";
import { productError, type ListProduct } from "./model";
import { DeleteProduct } from "./DeleteProduct";
import styles from "./products.module.css";

export const metadata = { title: "Productos | Administración ARA LOT" };
export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ pagina?: string; resultado?: string }> }) {
  const { supabase, allowed } = await productAccess();
  const params = await searchParams;
  const page = /^\d{1,6}$/.test(params.pagina ?? "") ? Math.max(1, Number(params.pagina)) : 1;
  if (!allowed) return <main id="admin-content" className={styles.page}><h1>Productos</h1><p role="alert">Tu cuenta no tiene permisos para gestionar productos.</p></main>;
  const { data, error, count } = await supabase.from("products")
    .select("id,name,slug,price,sale_price,active,updated_at,categories(name)", { count: "exact" })
    .order("created_at", { ascending: false }).order("id")
    .range((page - 1) * 30, page * 30 - 1).returns<ListProduct[]>();
  const money = (value: number) => `RD$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)}`;
  return <main id="admin-content" className={styles.page}>
    <header className={styles.heading}>
      <div><h1>Productos</h1><p>Gestiona productos, variantes y existencias.</p></div>
      <Link className={styles.primary} href="/admin/productos/nuevo">Nuevo producto</Link>
    </header>
    {params.resultado === "guardado" && <p role="status" className={styles.notice}>Producto guardado correctamente.</p>}
    {params.resultado === "eliminado" && <p role="status" className={styles.notice}>Producto eliminado correctamente.</p>}
    {error ? <p className={styles.notice} role="alert">{productError(error)}</p> : <>
      <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Listado de productos">
        <table className={styles.table}>
          <caption className={styles.caption}>{count ?? 0} productos</caption>
          <thead><tr><th scope="col">Nombre</th><th scope="col">Categoría</th><th scope="col">Precio</th><th scope="col">Precio de oferta</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr></thead>
          <tbody>{data?.map(product => <tr key={product.id}>
            <th scope="row">{product.name}</th>
            <td>{product.categories?.name ?? "Sin categoría"}</td>
            <td>{money(product.price)}</td><td>{product.sale_price === null ? "—" : money(product.sale_price)}</td>
            <td><span className={styles.badge}>{product.active ? "Activo" : "Inactivo"}</span></td>
            <td><div className={styles.actions}><Link href={`/admin/productos/${product.id}`} aria-label={`Editar ${product.name}`}>Editar</Link><DeleteProduct product={product} /></div></td>
          </tr>)}</tbody>
        </table>
        {!data?.length && <p className={styles.empty}>No hay productos en esta página.</p>}
      </div>
      <nav className={styles.pagination} aria-label="Páginas de productos">
        {page > 1 && <Link href={`/admin/productos?pagina=${page - 1}`}>Anterior</Link>}
        <span>Página {page}</span>
        {page * 30 < (count ?? 0) && <Link href={`/admin/productos?pagina=${page + 1}`}>Siguiente</Link>}
      </nav>
    </>}
  </main>;
}
