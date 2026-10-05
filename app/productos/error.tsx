"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
export default function ProductsError({reset}:{reset:()=>void}){
 const router=useRouter();
 const [pending,startTransition]=useTransition();
 return <section className="container" role="alert"><p>No pudimos cargar el catálogo. Tu carrito se conserva.</p><button type="button" disabled={pending} onClick={()=>startTransition(()=>{router.refresh();reset();})}>{pending?"Reintentando…":"Reintentar"}</button></section>;
}
