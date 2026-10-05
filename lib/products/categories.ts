import "server-only";
import { cache } from "react";
import { publicClient } from "./public-client";
import { safeImage } from "./images";
export type PublicCategory={id:string;name:string;slug:string;image_url:string|null;sort_order:number};
export const getCategories=cache(async()=>{
 try {
  const {data,error}=await publicClient().from("categories").select("id,name,slug,image_url,sort_order").eq("active",true).order("sort_order",{ascending:true}).order("id").returns<PublicCategory[]>();
  if(error)throw error;
  return {categories:(data??[]).map(c=>({...c,image_url:safeImage(c.image_url)||null})),error:null};
 }catch{return {categories:[] as PublicCategory[],error:"No pudimos cargar las categorías. Inténtalo nuevamente."};}
});
