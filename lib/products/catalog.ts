import { safeImage } from "./images";
export { safeImage } from "./images";
import type { Product } from "@/data/products";
export type CatalogVariant = { id: string; color?: string; size?: string; presentation?: string; image?: string; stock: number };
export type CatalogRow = {
 id: string; slug: string; name: string; description: string | null;
 price: number; sale_price: number | null; image_url: string | null;
 categories: { name: string; slug: string } | null;
 product_variants: { id: string; color: string | null; size: string | null; presentation: string | null; image_url: string | null; inventory: { quantity: number } | null }[];
};
export function mapProduct(row: CatalogRow): Product {
 const normal=Number(row.price), sale=row.sale_price===null?null:Number(row.sale_price);
 const offer=sale!==null&&Number.isFinite(sale)&&sale>=0&&sale<=normal;
 const variants: CatalogVariant[]=row.product_variants.map(v=>({
  id:v.id,color:v.color||undefined,size:v.size||undefined,presentation:v.presentation||undefined,
  image:safeImage(v.image_url)||undefined,stock:Number.isInteger(v.inventory?.quantity)&&v.inventory!.quantity>0?v.inventory!.quantity:0,
 }));
 const unique=(key:"color"|"size"|"presentation")=>[...new Set(variants.map(v=>v[key]).filter((v):v is string=>Boolean(v)))];
 const colors=unique("color"),sizes=unique("size"),presentations=unique("presentation");
 return {
  id:row.id,slug:row.slug,name:row.name,description:row.description??"",category:row.categories?.name??"",
  categorySlug:row.categories?.slug??"",price:offer?sale!:normal,
  compareAtPrice:offer&&sale!<normal?normal:undefined,
  badge:offer&&sale!<normal&&normal>0?"-"+Math.round((1-sale!/normal)*100)+"%":undefined,
  image:safeImage(row.image_url),variants,
  colors:colors.length?colors:undefined,sizes:sizes.length?sizes:undefined,
  presentation:presentations.length===1?presentations[0]:undefined,presentations,
  imagesByColor:Object.fromEntries(variants.filter(v=>v.color&&v.image).map(v=>[v.color!,v.image!])),
 };
}
export function selectedVariant(product: Product,color?:string,size?:string,presentation?:string) {
 return product.variants?.find(v=>v.color===color&&v.size===size&&v.presentation===presentation);
}
