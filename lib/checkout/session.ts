import { createHmac,randomBytes,randomUUID,timingSafeEqual,createHash } from "node:crypto";
export type CheckoutSession={id:string;cookie:string;owner:string;csrf:string};
export const COOKIE=process.env.NODE_ENV==="production"?"__Host-ara-checkout":"ara-checkout";
export function keyedHash(secret:string,value:string){return createHmac("sha256",secret).update(value).digest("hex");}
export function readSession(cookie:string|undefined,secret:string):CheckoutSession|null {
 if(!cookie||!/^([a-f0-9-]{36})\.([a-f0-9]{64})\.([a-f0-9]{64})$/.test(cookie))return null;
 const [id,token,signature]=cookie.split(".");
 if(!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id))return null;
 if(!timingSafeEqual(Buffer.from(signature,"hex"),Buffer.from(keyedHash(secret,id+"."+token),"hex")))return null;
 return {id,cookie,owner:createHash("sha256").update(token).digest("hex"),csrf:keyedHash(secret,"csrf:"+cookie)};
}
export function newSession(secret:string):CheckoutSession {
 const raw=randomUUID()+"."+randomBytes(32).toString("hex");
 return readSession(raw+"."+keyedHash(secret,raw),secret)!;
}
export function validCsrf(session:CheckoutSession,value:string|null){
 return Boolean(value&&/^[a-f0-9]{64}$/.test(value)&&timingSafeEqual(Buffer.from(value,"hex"),Buffer.from(session.csrf,"hex")));
}
