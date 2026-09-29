import Link from "next/link";
import { ProductCard } from "@/components/product/ProductCard";
import { productCategories, type Product } from "@/data/products";
import styles from "./Products.module.css";
type CatalogProduct={product:Product;hasImage:boolean;placeholderVariant:number};
export default function ProductCatalog({products,categoryKey}:{products:CatalogProduct[];categoryKey?:string}) {
 const category=products[0]?.product.category??Object.entries(productCategories).find(([key])=>key===categoryKey)?.[1];
 return <section aria-labelledby="products-title">
  <div className={styles.heading}><h1 id="products-title">{categoryKey?(category??"Categoría no encontrada"):"Todos los productos"}</h1>{categoryKey&&<Link href="/productos">Ver todos los productos →</Link>}</div>
  {products.length?<div className={styles.grid}>{products.map(({product,hasImage,placeholderVariant})=><ProductCard key={product.id} product={product} hasImage={hasImage} placeholderVariant={placeholderVariant}/>)}</div>:<p className={styles.empty}>Todavía no hay productos disponibles en esta categoría.</p>}
 </section>;
}
