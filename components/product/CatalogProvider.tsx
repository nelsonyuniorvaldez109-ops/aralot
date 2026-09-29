"use client";
import { createContext,useContext,useEffect,useState,type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { refreshCatalog } from "@/lib/products/actions";
import type { Product } from "@/data/products";
type Catalog={products:Product[];error:string|null};
const Context=createContext<Catalog>({products:[],error:null});
export function CatalogProvider({products,error,children}:Catalog&{children:ReactNode}){
 const [catalog,setCatalog]=useState<Catalog>({products,error});
 const pathname=usePathname();
 useEffect(()=>{
  let current=true;
  function refresh(){void refreshCatalog().then(result=>{if(current)setCatalog(result);}).catch(()=>{if(current)setCatalog(previous=>({...previous,error:"No pudimos actualizar el catálogo. Recarga la página."}));});}
  if(!pathname.startsWith("/admin"))refresh();
  function onVisible(){if(document.visibilityState==="visible"&&!pathname.startsWith("/admin"))refresh();}
  document.addEventListener("visibilitychange",onVisible);
  return ()=>{current=false;document.removeEventListener("visibilitychange",onVisible);};
 },[pathname]);
 return <Context.Provider value={catalog}>{children}</Context.Provider>;
}
export function useCatalog(){return useContext(Context);}
