"use client";
import { createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { refreshCatalog } from "@/lib/products/actions";
import { withCatalogTimeout,type LoadStatus } from "@/lib/products/recovery";
import type { Product } from "@/data/products";
type Catalog={products:Product[];error:string|null};
type State=Catalog&{status:LoadStatus};
const Context=createContext<State&{retry:()=>void}>({products:[],error:null,status:"loading",retry:()=>{}});
export function CatalogProvider({products,error,children}:Catalog&{children:ReactNode}){
 const [catalog,setCatalog]=useState<State>({products,error,status:error?"error":"ready"});
 const generation=useRef(0);
 const retry=useCallback(()=>{
  const current=++generation.current;
  setCatalog(previous=>({...previous,status:"loading",error:null}));
  void withCatalogTimeout(refreshCatalog()).then(result=>{
   if(current!==generation.current)return;
   setCatalog(previous=>result.error?{...previous,error:result.error,status:"error"}:{...result,status:"ready"});
  }).catch(()=>{
   if(current===generation.current)setCatalog(previous=>({...previous,status:"error",error:"No pudimos actualizar el catálogo. Tu carrito se conserva."}));
  });
 },[]);
 const cancelRefresh=useCallback(()=>{generation.current++;},[]);
 const pathname=usePathname();
 useEffect(()=>{
  const timer=setTimeout(()=>{if(!pathname.startsWith("/admin"))retry();},0);
  function onVisible(){if(document.visibilityState==="visible"&&!pathname.startsWith("/admin"))retry();}
  document.addEventListener("visibilitychange",onVisible);
  return ()=>{clearTimeout(timer);cancelRefresh();document.removeEventListener("visibilitychange",onVisible);};
 },[pathname,retry,cancelRefresh]);
 return <Context.Provider value={{...catalog,retry}}>{children}</Context.Provider>;
}
export function useCatalog(){return useContext(Context);}
