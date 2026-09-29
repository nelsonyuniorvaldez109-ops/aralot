import { notFound } from "next/navigation";
import { productAccess } from "../access";
import { ProductForm } from "../ProductForm";
import { isId, productError, type Category, type ProductDraft } from "../model";
import styles from "../products.module.css";

export const metadata = { title: "Editar producto | ARA LOT" };
type Row = { id: string; updated_at: string; name: string; slug: string; category_id: string | null; description: string | null; price: number; sale_price: number | null; image_url: string | null; active: boolean };
type VariantRow = { id: string; sku: string | null; color: string | null; size: string | null; presentation: string | null; image_url: string | null; active: boolean; inventory: { quantity: number; low_stock_threshold: number } | null };
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, allowed } = await productAccess();
  const { id } = await params;
  if (!allowed) return <main id="admin-content" className={styles.page}><p role="alert">Tu cuenta no tiene permisos para gestionar productos.</p></main>;
  if (!isId(id)) notFound();
  const [product, categories, variants] = await Promise.all([
    supabase.from("products").select("id,updated_at,name,slug,category_id,description,price,sale_price,image_url,active").eq("id", id).maybeSingle<Row>(),
    supabase.from("categories").select("id,name,active").order("sort_order").order("name").returns<Category[]>(),
    supabase.from("product_variants").select("id,sku,color,size,presentation,image_url,active,inventory(quantity,low_stock_threshold)").eq("product_id", id).order("created_at").order("id").returns<VariantRow[]>(),
  ]);
  const error = product.error ?? categories.error ?? variants.error;
  if (error) return <main id="admin-content" className={styles.page}><p role="alert">{productError(error)}</p></main>;
  if (!product.data) notFound();
  const p = product.data;
  const initial: ProductDraft = {
    ...p, category_id: p.category_id ?? "", description: p.description ?? "", image_url: p.image_url ?? "",
    price: String(p.price), sale_price: p.sale_price === null ? "" : String(p.sale_price),
    variants: (variants.data ?? []).map(v => ({
      id: v.id, sku: v.sku ?? "", color: v.color ?? "", size: v.size ?? "", presentation: v.presentation ?? "",
      image_url: v.image_url ?? "", active: v.active, quantity: String(v.inventory?.quantity ?? 0),
      low_stock_threshold: String(v.inventory?.low_stock_threshold ?? 5),
    })),
  };
  return <ProductForm key={p.updated_at} initial={initial} categories={categories.data ?? []} />;
}
