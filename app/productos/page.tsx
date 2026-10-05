import { CatalogRetry } from "@/components/product/CatalogRetry";
import { getProducts } from "@/lib/products/server";
import ProductCatalog from "./ProductCatalog";
import styles from "./Products.module.css";
export default async function ProductsPage({searchParams}:{searchParams:Promise<{categoria?:string|string[]}>}) {
 const params=await searchParams;
 const category=typeof params.categoria==="string"?params.categoria:undefined;
 const result=await getProducts(category);
 const products=result.products.map((product,index)=>({product,hasImage:Boolean(product.image),placeholderVariant:index%4+1}));
 return <div className={`container ${styles.page}`}>{result.error?<CatalogRetry message={result.error} />:<ProductCatalog products={products} categoryKey={category}/>}</div>;
}
