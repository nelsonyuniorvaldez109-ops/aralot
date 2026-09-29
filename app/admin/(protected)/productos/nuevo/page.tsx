import { productAccess } from "../access";
import { ProductForm } from "../ProductForm";
import { emptyProduct, productError, type Category } from "../model";
import styles from "../products.module.css";

export const metadata = { title: "Nuevo producto | ARA LOT" };
export default async function NewProductPage() {
  const { supabase, allowed } = await productAccess();
  if (!allowed) return <main id="admin-content" className={styles.page}><p role="alert">Tu cuenta no tiene permisos para gestionar productos.</p></main>;
  const { data, error } = await supabase.from("categories").select("id,name,active").order("sort_order").order("name").returns<Category[]>();
  if (error) return <main id="admin-content" className={styles.page}><p role="alert">{productError(error)}</p></main>;
  return <ProductForm initial={emptyProduct()} categories={data ?? []} />;
}
