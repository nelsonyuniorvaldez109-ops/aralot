"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
export function CatalogRetry({message}:{message:string}){
 const router=useRouter();
 const [pending,startTransition]=useTransition();
 return <div role="status"><p>{message}</p><button type="button" disabled={pending} onClick={()=>startTransition(()=>router.refresh())}>{pending?"Reintentando…":"Reintentar"}</button></div>;
}
