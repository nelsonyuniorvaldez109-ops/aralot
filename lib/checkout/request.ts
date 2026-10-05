import { findDeliveryProvince } from "@/data/delivery-locations";
import type { CustomerDetails } from "@/lib/whatsapp-order";
export class CheckoutError extends Error { constructor(public status:number,message:string){super(message);} }
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function normalizeOrder(value:unknown) {
 if(!value||typeof value!=="object"||Array.isArray(value))throw new CheckoutError(400,"Pedido no válido.");
 const body=value as Record<string,unknown>;
 if(typeof body.checkoutId!=="string"||!uuid.test(body.checkoutId))throw new CheckoutError(400,"Identificador no válido.");
 if(!Array.isArray(body.items)||!body.items.length||body.items.length>50)throw new CheckoutError(400,"Revisa los productos.");
 const quantities=new Map<string,number>();
 for(const raw of body.items){
  if(!raw||typeof raw!=="object"||typeof raw.variantId!=="string"||!uuid.test(raw.variantId)||!Number.isInteger(raw.quantity)||raw.quantity<1||raw.quantity>20)throw new CheckoutError(400,"Variante o cantidad no válida.");
  const id=raw.variantId.toLowerCase(),quantity=(quantities.get(id)??0)+raw.quantity;
  if(quantity>20)throw new CheckoutError(400,"Máximo 20 unidades por variante.");
  quantities.set(id,quantity);
 }
 if(!body.customer||typeof body.customer!=="object"||Array.isArray(body.customer))throw new CheckoutError(400,"Revisa los datos del cliente.");
 const c=body.customer as Record<string,unknown>;
 function text(name:string,max:number,required=true){
  if(typeof c[name]!=="string")throw new CheckoutError(400,"Revisa los datos del cliente.");
  const s=(c[name] as string).normalize("NFC").replace(/\s+/g," ").trim();
  if(s.length>max||(required&&!s)||/[\u0000-\u001f\u007f]/.test(s))throw new CheckoutError(400,"Revisa los datos del cliente.");
  return s;
 }
 const method=text("deliveryMethod",10);
 if(method!=="RECOGER"&&method!=="ENVÍO")throw new CheckoutError(400,"Selecciona un método de entrega.");
 const phone=text("phone",25).replace(/[\s-]/g,"");
 if(!/^(?:\+?1)?(?:809|829|849)\d{7}$/.test(phone))throw new CheckoutError(400,"Ingresa un teléfono válido.");
 const local=phone.replace(/^\+?1/,""),email=text("email",254).toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new CheckoutError(400,"Ingresa un correo válido.");
 const customer:CustomerDetails={name:text("name",161),phone:`+1 ${local.slice(0,3)}-${local.slice(3,6)}-${local.slice(6)}`,email,deliveryMethod:method,province:"",city:"",sector:"",address:"",reference:""};
 if(method==="ENVÍO"){
  Object.assign(customer,{province:text("province",100),city:text("city",100),sector:text("sector",100),address:text("address",200),reference:text("reference",300,false)});
  if(!findDeliveryProvince(customer.province)?.municipalities.includes(customer.city))throw new CheckoutError(400,"Provincia o municipio no válido.");
 }
 return {checkoutId:body.checkoutId.toLowerCase(),customer,items:[...quantities].sort(([a],[b])=>a.localeCompare(b)).map(([variant_id,quantity])=>({variant_id,quantity}))};
}
export async function readBody(request:Request){
 if(!request.headers.get("content-type")?.startsWith("application/json"))throw new CheckoutError(415,"Usa JSON.");
 const reader=request.body?.getReader();if(!reader)throw new CheckoutError(400,"Solicitud vacía.");
 const chunks:Uint8Array[]=[];let size=0;
 try {while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>32768){await reader.cancel();throw new CheckoutError(413,"Pedido demasiado grande.");}chunks.push(value);}}
 finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new CheckoutError(400,"Solicitud no válida.");}
}
