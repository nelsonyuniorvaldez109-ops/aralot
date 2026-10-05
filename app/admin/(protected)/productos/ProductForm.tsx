"use client";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { saveProduct } from "./actions";
import { emptyVariant, type Category, type ProductDraft, type SaveState } from "./model";
import { collectVariants, groupColors, newColor, type ColorGroup } from "./variant-groups";
import { ImageUpload } from "./ImageUpload";
import styles from "./products.module.css";

export function ProductForm({initial,categories}:{initial:ProductDraft;categories:Category[]}) {
 const [draft,setDraft]=useState(initial);
 const [inventoryBaseline]=useState(initial.variants);
 const [colors,setColors]=useState<ColorGroup[]>(()=>groupColors(initial.variants).filter(g=>g.variants.some(v=>v.id)));
 const [presentations,setPresentations]=useState(()=>initial.variants.filter(v=>v.presentation&&!v.color&&!v.size));
 const [uploads,setUploads]=useState(0);
 const [state,action,pending]=useActionState<SaveState,FormData>(saveProduct,{error:""});
 const category=categories.find(c=>c.id===draft.category_id);
 const care=category?.name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().includes("cuidado")??false;
 const variants=collectVariants(inventoryBaseline,care?presentations:colors.flatMap(g=>g.variants.map(v=>({...v,color:g.color}))));
 const payload={...draft,variants};
 const busy=pending||uploads>0;
 const activeCount=variants.filter(v=>v.active).length;
 function set<K extends keyof ProductDraft>(key:K,value:ProductDraft[K]) {setDraft(d=>({...d,[key]:value}));}
 function colorChange(key:string,update:(group:ColorGroup)=>ColorGroup){setColors(gs=>gs.map(g=>g.key===key?update(g):g));}
 function uploading(value:boolean){setUploads(n=>n+(value?1:-1));}
 useEffect(()=>{if(state.error)document.getElementById("product-errors")?.focus();},[state]);
 function field(key:"name"|"price"|"sale_price",label:string,required=false) {
  return <div className={styles.field}><label htmlFor={"product-"+key}>{label}{required?" *":""}</label>
   <input id={"product-"+key} type={key==="name"?"text":"number"} value={draft[key]} required={required} maxLength={key==="name"?200:undefined} min={key==="name"?undefined:0} step={key==="name"?undefined:".01"} onChange={e=>set(key,e.target.value)} aria-invalid={Boolean(state.fields?.[key])}/>
   {state.fields?.[key]&&<p className={styles.fieldError}>{state.fields[key]}</p>}
  </div>;
 }
 return <main id="admin-content" className={styles.page}>
  <header className={styles.heading}><div><p>CATÁLOGO / PRODUCTOS</p><h1>{initial.id?"Editar producto":"Nuevo producto"}</h1><p>Organiza la información, las imágenes y las opciones disponibles.</p></div><Link className={styles.secondary} href="/admin/productos">Volver a productos</Link></header>
  <form action={action}>
   <input type="hidden" name="payload" value={JSON.stringify(payload)}/>
   {state.error&&<div id="product-errors" tabIndex={-1} role="alert" className={styles.notice}><strong>{state.error}</strong>{state.fields&&<ul>{Object.entries(state.fields).map(([key,error])=><li key={key}>{error}</li>)}</ul>}</div>}
   <fieldset disabled={busy} className={styles.formFields}>
    <div className={styles.editorGrid}>
     <div>
      <section className={styles.card}><h2>Información</h2><div className={styles.grid}>
       {field("name","Nombre",true)}
       <div className={styles.field}><label htmlFor="product-category_id">Categoría *</label><select id="product-category_id" value={draft.category_id} required onChange={e=>set("category_id",e.target.value)} aria-invalid={Boolean(state.fields?.category_id)}><option value="">Selecciona una categoría</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}{!c.active?" (inactiva)":""}</option>)}</select>{state.fields?.category_id&&<p>{state.fields.category_id}</p>}</div>
       <div className={styles.full+" "+styles.field}><label htmlFor="product-description">Descripción (opcional)</label><textarea id="product-description" rows={4} maxLength={10000} value={draft.description} onChange={e=>set("description",e.target.value)}/></div>
      </div><label className={styles.check}><input type="checkbox" checked={draft.active} onChange={e=>set("active",e.target.checked)}/>Producto activo</label></section>
      <section className={styles.card}><h2>Precio</h2><div className={styles.grid}>{field("price","Precio (RD$)",true)}{field("sale_price","Precio de oferta (opcional)")}</div></section>
     </div>
     <section className={styles.card}><h2>Imagen principal</h2><ImageUpload label="Imagen del producto" value={draft.image_url} onChange={url=>set("image_url",url)} onBusy={uploading}/></section>
    </div>
    <section className={styles.card}><h2>{care?"Presentaciones y stock":"Colores y tallas"}</h2>
     <p className={styles.hint}>{care?"Añade cada presentación disponible y sus unidades.":"Selecciona las tallas disponibles. Una imagen por color es suficiente para todas sus tallas."}</p>
     {care?presentations.map((v,index)=><div key={v.id??index} className={styles.variantPanel}><div className={styles.grid}>
      <div className={styles.field}><label htmlFor={"presentation-"+index}>Presentación *</label><input id={"presentation-"+index} required maxLength={150} placeholder="400 ml" value={v.presentation} onChange={e=>setPresentations(vs=>vs.map((x,i)=>i===index?{...x,presentation:e.target.value}:x))}/></div>
      <div className={styles.field}><label htmlFor={"stock-"+index}>Stock</label><input id={"stock-"+index} type="number" min="0" step="1" required value={v.quantity} onChange={e=>setPresentations(vs=>vs.map((x,i)=>i===index?{...x,quantity:e.target.value}:x))}/></div>
     </div><label className={styles.check}><input type="checkbox" checked={v.active} onChange={e=>setPresentations(vs=>vs.map((x,i)=>i===index?{...x,active:e.target.checked}:x))}/>Disponible</label>
     <button type="button" className={styles.textButton} onClick={()=>setPresentations(vs=>vs.filter((_,i)=>i!==index))}>Quitar presentación</button></div>)
     :colors.map(group=><div key={group.key} className={styles.variantPanel}>
      <div className={styles.heading}><div className={styles.field}><label htmlFor={group.key}>Color *</label><input id={group.key} value={group.color} required maxLength={100} placeholder="Negro" onChange={e=>colorChange(group.key,g=>({...g,color:e.target.value}))}/></div><button type="button" className={styles.textButton} onClick={()=>setColors(gs=>gs.filter(g=>g.key!==group.key))}>Quitar color</button></div>
      <div className={styles.colorLayout}>
       <ImageUpload label="Imagen del color" value={group.image} onBusy={uploading} onChange={url=>colorChange(group.key,g=>({...g,image:url,variants:g.variants.map(v=>({...v,image_url:url}))}))}/>
       <div className={styles.sizes}>{Array.from(new Set(["S","M","L","XL",...group.variants.map(v=>v.size)])).map(size=>{
        const variant=group.variants.find(v=>v.size===size);
        const update=(values:Partial<typeof initial.variants[number]>)=>colorChange(group.key,g=>({...g,variants:variant?g.variants.map(v=>v.size===size?{...v,...values}:v):[...g.variants,{...emptyVariant(),size,color:g.color,image_url:g.image,...values}]}));
        return <div key={size} className={styles.sizeRow}><label className={styles.check}><input type="checkbox" checked={variant?.active??false} onChange={e=>update({active:e.target.checked})}/>{size||"Única"}</label><div className={styles.field}><label htmlFor={group.key+"-"+size}>Stock {size||"única"}</label><input id={group.key+"-"+size} type="number" min="0" step="1" required={variant?.active} disabled={!variant?.active} value={variant?.quantity??"0"} onChange={e=>update({quantity:e.target.value})}/></div></div>;
       })}</div>
      </div>
     </div>)}
     <button type="button" className={styles.secondary} disabled={variants.length>=100} onClick={()=>care?setPresentations(vs=>[...vs,emptyVariant()]):setColors(gs=>[...gs,newColor()])}>＋ {care?"Agregar presentación":"Agregar otro color"}</button>
     {!activeCount&&<p className={styles.hint}>Añade al menos una opción disponible para un producto activo.</p>}
     {initial.id&&<p className={styles.hint}>Las opciones retiradas se guardan como inactivas. Sus imágenes se conservan.</p>}
    </section>
   </fieldset>
   <div className={styles.formFooter}><Link href="/admin/productos">Cancelar</Link><button className={styles.primary} type="submit" disabled={busy||!categories.length||(draft.active&&!activeCount)}>{pending?"Guardando…":uploads?"Subiendo imagen…":"Guardar producto"}</button></div>
  </form>
 </main>;
}
